import { spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import lighthouse from 'lighthouse'
import { createRequire } from 'node:module'
import { baseUrl, pages, profiles, runsPerPage } from '../lighthouse/config.mjs'

const require = createRequire(import.meta.url)
const lighthouseVersion = require('lighthouse/package.json').version
const reportsDir = fileURLToPath(new URL('../lighthouse/reports/', import.meta.url))
const resultsPath = fileURLToPath(new URL('../lighthouse/RESULTS.md', import.meta.url))
const runs = Number(process.env.LH_RUNS ?? runsPerPage)
const metricKeys = {
  lcp: 'largest-contentful-paint',
  cls: 'cumulative-layout-shift',
  tbt: 'total-blocking-time',
}
const categoryKeys = ['performance', 'accessibility', 'best-practices', 'seo']
const targets = { performance: 90, accessibility: 95, 'best-practices': 95, seo: 90 }

async function isUp(url) {
  try {
    const res = await fetch(url)
    return res.ok
  } catch {
    return false
  }
}

async function ensurePreview() {
  if (await isUp(baseUrl)) return null
  const child = spawn('pnpm', ['preview'], { stdio: 'ignore', detached: true })
  for (let i = 0; i < 60; i += 1) {
    await new Promise((r) => setTimeout(r, 1000))
    if (await isUp(baseUrl)) return child
  }
  throw new Error(`preview não respondeu em ${baseUrl}`)
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function fmt(value, unit) {
  if (unit === 'ms') return `${Math.round(value)} ms`
  if (unit === 'score') return String(Math.round(value))
  return value.toFixed(3)
}

async function launchChrome(dir) {
  const port = 9222 + Math.floor(Math.random() * 500)
  const child = spawn(
    chromium.executablePath(),
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${dir}`,
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )
  for (let i = 0; i < 50; i += 1) {
    await new Promise((r) => setTimeout(r, 200))
    if (await isUp(`http://127.0.0.1:${port}/json/version`)) {
      return { port, kill: () => child.kill('SIGTERM') }
    }
  }
  child.kill('SIGKILL')
  throw new Error('Chromium não abriu a porta de depuração')
}

async function audit(chrome, url, config) {
  const result = await lighthouse(
    url,
    { port: chrome.port, output: ['html', 'json'], logLevel: 'error' },
    config,
  )
  const lhr = result.lhr
  return {
    html: result.report[0],
    json: result.report[1],
    scores: Object.fromEntries(categoryKeys.map((key) => [key, lhr.categories[key].score * 100])),
    metrics: Object.fromEntries(
      Object.entries(metricKeys).map(([k, id]) => [k, lhr.audits[id].numericValue]),
    ),
    userAgent: lhr.environment.hostUserAgent,
    throttling: lhr.configSettings.throttling,
    formFactor: lhr.configSettings.formFactor,
  }
}

const preview = await ensurePreview()
const userDataDir = mkdtempSync(join(os.tmpdir(), 'kurio-lighthouse-'))
const chrome = await launchChrome(userDataDir)
mkdirSync(reportsDir, { recursive: true })

const summary = []
let environment = null
try {
  for (const page of pages) {
    for (const [profileName, config] of Object.entries(profiles)) {
      const url = `${baseUrl}${page.path}`
      process.stdout.write(`${page.key}/${profileName}: aquecimento… `)
      await audit(chrome, url, config)
      const samples = []
      for (let i = 1; i <= runs; i += 1) {
        process.stdout.write(`${i} `)
        const sample = await audit(chrome, url, config)
        writeFileSync(`${reportsDir}${page.key}-${profileName}-${i}.html`, sample.html)
        writeFileSync(`${reportsDir}${page.key}-${profileName}-${i}.json`, sample.json)
        samples.push(sample)
        environment ??= { userAgent: sample.userAgent }
      }
      process.stdout.write('\n')
      summary.push({
        page: page.key,
        path: page.path,
        profile: profileName,
        throttling: samples[0].throttling,
        scores: Object.fromEntries(
          categoryKeys.map((key) => [key, median(samples.map((s) => s.scores[key]))]),
        ),
        metrics: Object.fromEntries(
          Object.keys(metricKeys).map((key) => [key, median(samples.map((s) => s.metrics[key]))]),
        ),
        raw: samples.map((s) => ({ scores: s.scores, metrics: s.metrics })),
      })
    }
  }
} finally {
  chrome.kill()
  rmSync(userDataDir, { recursive: true, force: true })
  if (preview) process.kill(-preview.pid)
}

const chromeVersion = /Chrome\/([\d.]+)/.exec(environment?.userAgent ?? '')?.[1] ?? 'desconhecida'
const lines = []
lines.push('# Lighthouse')
lines.push('')
lines.push(
  `Medições em ${new Date().toISOString()} com build de produção (\`pnpm build && pnpm preview\`), mocks ativos no cenário padrão, ${runs} execuções por página e perfil após uma execução de aquecimento para registrar o service worker. Os valores abaixo são a mediana de cada categoria e métrica.`,
)
lines.push('')
lines.push(
  '| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |',
)
lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
for (const row of summary) {
  const cell = (key) => {
    const value = Math.round(row.scores[key])
    return value < targets[key] ? `**${value}**` : String(value)
  }
  lines.push(
    `| ${row.path} | ${row.profile} | ${cell('performance')} | ${cell('accessibility')} | ${cell('best-practices')} | ${cell('seo')} | ${fmt(row.metrics.lcp, 'ms')} | ${fmt(row.metrics.cls, 'cls')} | ${fmt(row.metrics.tbt, 'ms')} |`,
  )
}
lines.push('')
lines.push(
  'Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Valores em negrito ficaram abaixo da meta.',
)
lines.push('')
lines.push('## Execuções individuais')
lines.push('')
for (const row of summary) {
  lines.push(`### ${row.path} (${row.profile})`)
  lines.push('')
  lines.push('| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |')
  lines.push('| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |')
  row.raw.forEach((sample, index) => {
    lines.push(
      `| ${index + 1} | ${fmt(sample.scores.performance, 'score')} | ${fmt(sample.scores.accessibility, 'score')} | ${fmt(sample.scores['best-practices'], 'score')} | ${fmt(sample.scores.seo, 'score')} | ${fmt(sample.metrics.lcp, 'ms')} | ${fmt(sample.metrics.cls, 'cls')} | ${fmt(sample.metrics.tbt, 'ms')} |`,
    )
  })
  lines.push('')
}
lines.push('## Ambiente')
lines.push('')
lines.push(
  `- Lighthouse ${lighthouseVersion}, Chromium ${chromeVersion} (headless, binário do Playwright)`,
)
lines.push(
  `- Node ${process.version}, ${os.type()} ${os.release()} (${os.arch()}), ${os.cpus()[0]?.model ?? 'cpu'} × ${os.cpus().length}`,
)
lines.push(
  `- Perfil mobile: emulação padrão do Lighthouse (Moto G Power, throttling simulado 4G lento, CPU 4x)`,
)
lines.push(
  `- Perfil desktop: preset \`desktopConfig\` do Lighthouse (1350×940, sem throttling de CPU, rede 10 Mbps)`,
)
lines.push(
  `- Configuração versionada em \`lighthouse/config.mjs\`; relatórios HTML e JSON em \`lighthouse/reports/\``,
)
lines.push(`- Comando: \`pnpm lighthouse\` (variável \`LH_RUNS\` altera o número de execuções)`)
lines.push('')
writeFileSync(resultsPath, lines.join('\n'))
console.log(`\nResumo escrito em lighthouse/RESULTS.md`)
for (const row of summary) {
  console.log(
    `${row.path} ${row.profile}: perf ${Math.round(row.scores.performance)} a11y ${Math.round(row.scores.accessibility)} bp ${Math.round(row.scores['best-practices'])} seo ${Math.round(row.scores.seo)} | LCP ${Math.round(row.metrics.lcp)}ms CLS ${row.metrics.cls.toFixed(3)} TBT ${Math.round(row.metrics.tbt)}ms`,
  )
}
