# Lighthouse

Medições em 2026-10-14T03:02:58.819Z com build de produção (`pnpm build && pnpm preview`), mocks ativos no cenário padrão, 2 execuções por página e perfil após uma execução de aquecimento para registrar o service worker. Os valores abaixo são a mediana de cada categoria e métrica.

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | mobile | **71** | 100 | 100 | 100 | 4662 ms | 0.000 | 240 ms |
| / | desktop | 99 | 100 | 100 | 100 | 842 ms | 0.000 | 0 ms |
| /nft/emerald-ape-042 | mobile | **77** | 100 | 100 | 100 | 4351 ms | 0.000 | 78 ms |
| /nft/emerald-ape-042 | desktop | 99 | 100 | 100 | 100 | 915 ms | 0.000 | 0 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Valores em negrito ficaram abaixo da meta.

## Execuções individuais

### / (mobile)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 70 | 100 | 100 | 100 | 4660 ms | 0.000 | 250 ms |
| 2 | 71 | 100 | 100 | 100 | 4664 ms | 0.000 | 229 ms |

### / (desktop)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 842 ms | 0.000 | 0 ms |
| 2 | 99 | 100 | 100 | 100 | 842 ms | 0.000 | 0 ms |

### /nft/emerald-ape-042 (mobile)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 77 | 100 | 100 | 100 | 4358 ms | 0.000 | 84 ms |
| 2 | 77 | 100 | 100 | 100 | 4345 ms | 0.000 | 72 ms |

### /nft/emerald-ape-042 (desktop)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 918 ms | 0.000 | 0 ms |
| 2 | 99 | 100 | 100 | 100 | 913 ms | 0.000 | 0 ms |

## Ambiente

- Lighthouse 13.5.0, Chromium 156.0.8078.4 (headless, binário do Playwright)
- Node v24.18.0, Linux 6.18.54.1-microsoft-standard-WSL2 (x64), 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz × 6
- Perfil mobile: emulação padrão do Lighthouse (Moto G Power, throttling simulado 4G lento, CPU 4x)
- Perfil desktop: preset `desktopConfig` do Lighthouse (1350×940, sem throttling de CPU, rede 10 Mbps)
- Configuração versionada em `lighthouse/config.mjs`; relatórios HTML e JSON em `lighthouse/reports/`
- Comando: `pnpm lighthouse` (variável `LH_RUNS` altera o número de execuções)
