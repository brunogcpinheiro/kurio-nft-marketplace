import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const SEED = 20261013
const OUT = fileURLToPath(new URL('../src/mocks/fixtures/nfts.json', import.meta.url))

function mulberry32(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(SEED)
const pick = (list) => list[Math.floor(rand() * list.length)]
const between = (min, max) => min + rand() * (max - min)
const int = (min, max) => Math.floor(between(min, max + 1))
const money = (value) => (Math.round(value * 100) / 100).toFixed(2)
const hex = (size) => Array.from({ length: size }, () => '0123456789abcdef'[int(0, 15)]).join('')

const imageKeys = ['emerald', 'sage', 'ivory', 'golden']
const categories = [
  ['arte-digital', 'Arte digital', 14],
  ['fotografia', 'Fotografia', 5],
  ['musica', 'Música', 9],
  ['arte-3d', 'Arte 3D', 8],
  ['colecionaveis', 'Colecionáveis', 7],
  ['generativa', 'Generativa', 6],
  ['jogos', 'Jogos', 5],
  ['assinaturas', 'Assinaturas', 3],
  ['utilidade', 'Utilidade', 3],
]
const networks = [
  'ethereum',
  'ethereum',
  'ethereum',
  'ethereum',
  'ethereum',
  'polygon',
  'polygon',
  'polygon',
  'solana',
  'solana',
]
const collections = {
  emerald: ['Kurio Apes', 'Kurio Editions'],
  sage: ['Nomad Series', 'Kurio Editions'],
  ivory: ['Neon District', 'Kurio Apes'],
  golden: ['Golden Era', 'Nomad Series'],
}
const adjectives = [
  'Amber',
  'Azure',
  'Cosmic',
  'Crimson',
  'Dusk',
  'Ember',
  'Frost',
  'Golden',
  'Ivory',
  'Jade',
  'Lunar',
  'Neon',
  'Obsidian',
  'Opal',
  'Sage',
  'Scarlet',
  'Silver',
  'Solar',
  'Velvet',
  'Violet',
]
const nouns = [
  'Ape',
  'Baron',
  'Beat',
  'Bloom',
  'Drifter',
  'Echo',
  'Frequency',
  'Nomad',
  'Oracle',
  'Pilot',
  'Signal',
  'Vessel',
  'Voyager',
  'Warden',
]
const attributePool = {
  emerald: ['Óculos', 'Esmeralda', 'Jaqueta universitária', 'Colar'],
  sage: ['Chapéu bucket', 'Moletom roxo', 'Olhar sereno'],
  ivory: ['Terno marfim', 'Gola alta', 'Brinco'],
  golden: ['Fones', 'Pelagem dourada', 'Jaqueta creme'],
}
const extraAttributes = [
  'Raro',
  'Edição limitada',
  'Arte desbloqueável',
  'Fundo gradiente',
  'Assinado',
]

const featured = [
  ['Emerald Ape', '042', 'emerald', '1.19', null, false, 'arte-digital', 'ethereum'],
  ['Sage Nomad', '009', 'sage', '1.69', null, false, 'colecionaveis', 'ethereum'],
  ['Neon Vessel', '552', 'ivory', '1.99', '2.29', true, 'arte-3d', 'polygon'],
  ['Cosmic Bloom', '118', 'sage', '1.29', null, false, 'generativa', 'ethereum'],
  ['Violet Nomad', '314', 'sage', '1.39', null, false, 'colecionaveis', 'polygon'],
  ['Ivory Baron', '088', 'ivory', '1.79', null, false, 'arte-digital', 'ethereum'],
  ['Golden Beat', '207', 'golden', '0.99', null, false, 'musica', 'solana'],
  ['Golden Frequency', '071', 'golden', '0.59', null, false, 'musica', 'ethereum'],
  ['Golden Signal', '160', 'golden', '0.39', null, false, 'musica', 'polygon'],
]

const baseDate = Date.UTC(2026, 9, 12, 12, 0, 0)
const day = 24 * 60 * 60 * 1000

function describe(name, collection, networkName, editionLabel) {
  return {
    description: `Um colecionável digital finalizado à mão da coleção ${collection}, verificado na ${networkName}, com arte desbloqueável e acesso para colecionadores.`,
    longDescription: `${name} é uma obra digital ${editionLabel} finalizada à mão da coleção ${collection}. Cada atributo fica armazenado nos metadados do token e verificado na ${networkName}. A obra explora identidade, movimento e luz em um mundo digital sem fronteiras.\n\nA propriedade inclui a arte em alta resolução, lançamentos exclusivos para colecionadores e um registro permanente de procedência registrada na rede. O criador recebe 5% de direitos autorais nas vendas secundárias, apoiando novos trabalhos e lançamentos da comunidade.`,
  }
}

const networkNames = { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' }

function editionsFor(price, index) {
  const base = Number(price)
  const oneOfOne = index === 0 ? 0 : rand() < 0.35 ? 0 : 1
  const tenAvailable = rand() < 0.12 ? 0 : int(1, 10)
  const fiftyAvailable = index < 9 ? int(12, 50) : rand() < 0.08 ? 0 : int(2, 50)
  return [
    { id: 'e1', label: '1/1', price: money(base * 4), available: oneOfOne, total: 1 },
    { id: 'e10', label: '1/10', price: money(base * 1.6), available: tenAvailable, total: 10 },
    { id: 'e50', label: '1/50', price: money(base), available: fiftyAvailable, total: 50 },
    {
      id: 'open',
      label: 'Aberta',
      price: money(Math.max(0.02, base * 0.6)),
      available: 500,
      total: null,
    },
  ]
}

const used = new Set()
const nfts = []

function push(entry, index) {
  const [baseName, tokenId, imageKey, price, previousPrice, rare, category, network] = entry
  const name = `${baseName} #${tokenId}`
  const slug = `${baseName.toLowerCase().replace(/\s+/g, '-')}-${tokenId}`
  if (used.has(slug)) return false
  used.add(slug)
  const collection = pick(collections[imageKey])
  const editions = editionsFor(price, index)
  const text = describe(name, collection, networkNames[network], '1/50')
  const attributes = [
    ...attributePool[imageKey].slice(0, int(2, 3)),
    ...(rare ? ['Raro'] : [pick(extraAttributes)]),
  ]
  const listedAt = new Date(
    baseDate - (index < 9 ? index * 0.5 * day : between(10, 90) * day),
  ).toISOString()
  nfts.push({
    id: `nft_${tokenId}`,
    slug,
    name,
    tokenId,
    imageKey,
    price,
    previousPrice,
    rare,
    network,
    category,
    version: 1,
    collection,
    ...text,
    attributes,
    rating: { average: Math.round(between(3.8, 5) * 10) / 10, count: int(3, 40) },
    editions,
    contract: `0x${hex(40)}`,
    listedAt,
    trendingScore: index < 9 ? int(70, 100) : int(0, 100),
  })
  return true
}

featured.forEach((entry, index) => push(entry, index))

const weightedCategories = categories.flatMap(([slug, , weight]) =>
  Array.from({ length: weight }, () => slug),
)
let index = nfts.length
while (nfts.length < 60) {
  const imageKey = imageKeys[index % 4]
  const tokenId = String(int(1, 999)).padStart(3, '0')
  let category = pick(weightedCategories)
  let network = pick(networks)
  if (category === 'assinaturas' && network === 'solana') network = 'ethereum'
  const price = money(between(0.02, 12.3))
  const previousPrice = rand() < 0.2 ? money(Number(price) * between(1.1, 1.4)) : null
  const rare = rand() < 0.15
  if (
    push(
      [
        `${pick(adjectives)} ${pick(nouns)}`,
        tokenId,
        imageKey,
        price,
        previousPrice,
        rare,
        category,
        network,
      ],
      index,
    )
  )
    index += 1
}

writeFileSync(OUT, JSON.stringify(nfts, null, 2) + '\n')
console.log(`${nfts.length} nfts -> ${OUT}`)
