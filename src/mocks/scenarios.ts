export const scenarioList = [
  {
    name: 'default',
    title: 'Padrão',
    description: 'Latência curta, tudo funciona e o pedido confirma em 3 segundos.',
  },
  {
    name: 'slow-network',
    title: 'Rede lenta',
    description: 'Toda requisição demora entre 2,5 e 4 segundos.',
  },
  {
    name: 'variable-latency',
    title: 'Latência variável',
    description: 'Latência aleatória entre 50 ms e 3 segundos.',
  },
  {
    name: 'out-of-order',
    title: 'Respostas fora de ordem',
    description: 'No catálogo, a primeira busca demora mais que as seguintes.',
  },
  {
    name: 'offline',
    title: 'Sem conexão',
    description: 'Todas as requisições falham com erro de rede.',
  },
  {
    name: 'server-error',
    title: 'Erro no servidor',
    description: 'Catálogo e conteúdo respondem 503 nas três primeiras tentativas, depois voltam.',
  },
  {
    name: 'session-expired',
    title: 'Sessão expirada',
    description: 'A próxima requisição autenticada devolve 401 e encerra a sessão.',
  },
  {
    name: 'register-conflict',
    title: 'Conflito no cadastro',
    description: 'Qualquer cadastro responde que o e-mail já está em uso.',
  },
  {
    name: 'coupon-expired',
    title: 'Cupom expirado',
    description: 'O cupom KURIO10 passa a responder como expirado.',
  },
  {
    name: 'price-change-in-checkout',
    title: 'Preço alterado na compra',
    description: 'Cinco segundos após conectar, o primeiro item do carrinho sobe 15%.',
  },
  {
    name: 'edition-sold-out',
    title: 'Edição esgotada na compra',
    description: 'Cinco segundos após conectar, a edição do primeiro item do carrinho esgota.',
  },
  {
    name: 'order-timeout',
    title: 'Timeout no pedido',
    description: 'O pedido é criado, mas a resposta só chega após 12 segundos.',
  },
  {
    name: 'payment-rejected',
    title: 'Pagamento recusado',
    description: 'O pedido é recusado pela rede após 3 segundos.',
  },
  {
    name: 'wallet-refused',
    title: 'Carteira recusa conexão',
    description: 'A simulação de conexão da carteira termina recusada.',
  },
  {
    name: 'favorites-fail',
    title: 'Falha nos favoritos',
    description: 'Favoritar e desfavoritar respondem 503.',
  },
  {
    name: 'empty-catalog',
    title: 'Catálogo vazio',
    description: 'O catálogo responde sem nenhum NFT.',
  },
] as const

export type ScenarioName = (typeof scenarioList)[number]['name']

export const scenarioStorageKey = 'kurio:scenario'

const names = new Set<string>(scenarioList.map((s) => s.name))

export function isScenarioName(value: unknown): value is ScenarioName {
  return typeof value === 'string' && names.has(value)
}

export const scenarioState = {
  serverErrorHits: 0,
  sessionExpiredConsumed: false,
  lastCatalogCallAt: 0,
}

export function getScenario(): ScenarioName {
  try {
    const stored = localStorage.getItem(scenarioStorageKey)
    return isScenarioName(stored) ? stored : 'default'
  } catch {
    return 'default'
  }
}

export function setScenario(name: ScenarioName) {
  localStorage.setItem(scenarioStorageKey, name)
  scenarioState.serverErrorHits = 0
  scenarioState.sessionExpiredConsumed = false
  scenarioState.lastCatalogCallAt = 0
}
