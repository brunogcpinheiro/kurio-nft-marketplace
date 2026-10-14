# Kurio — Marketplace de NFTs

Implementação do desafio de frontend: um marketplace de NFTs com descoberta, compra e conta do colecionador, em React e TypeScript, seguindo o layout do Figma. A API, a autenticação, as carteiras e o pagamento são simulados com MSW diretamente no browser, inclusive no deploy, então tudo funciona a partir de um checkout limpo e sem backend.

Deploy: `https://kurio-nft-marketplace.vercel.app` (atualizo este link quando publicar).

As decisões de arquitetura, os contratos REST e de eventos, a política de cache e os desvios em relação ao Figma estão em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Requisitos

- Node 22.12 ou mais novo (desenvolvi com Node 24)
- pnpm 11

## Rodando

```bash
pnpm install
pnpm exec playwright install chromium
pnpm dev
```

A aplicação abre em `http://localhost:5173` com os mocks ativos. Na primeira carga o service worker do MSW é registrado; se alguma requisição falhar logo no primeiro segundo, basta recarregar.

Build de produção e preview local (é o que o deploy e os testes usam):

```bash
pnpm build
pnpm preview
```

## Variáveis de ambiente

Nenhuma variável é obrigatória: sem arquivo `.env` o app sobe com os mocks ligados e os endereços da tabela abaixo. O `.env.example` lista as variáveis com esses valores. Para personalizar, copie ou renomeie o exemplo para `.env.development` (usado por `pnpm dev`) ou `.env.production` (usado por `pnpm build`); os arquivos `.env*` são ignorados pelo git, exceto o exemplo.

```bash
cp .env.example .env.development
cp .env.example .env.production
```

| Variável           | Padrão                       | Uso                                                                          |
| ------------------ | ---------------------------- | ---------------------------------------------------------------------------- |
| `VITE_API_MOCKING` | `true`                       | Liga o MSW. Com `false`, o app fala com `VITE_API_URL` sem interceptação     |
| `VITE_API_URL`     | `/api`                       | Base das chamadas REST do Axios                                              |
| `VITE_SOCKET_URL`  | `wss://realtime.kurio.local` | Endereço do servidor Socket.IO. Com os mocks ligados é interceptado pelo MSW |

Para apontar para uma API real, basta `VITE_API_MOCKING=false` e os endereços corretos, nesses arquivos ou nas variáveis do projeto na Vercel.

## Credenciais fictícias

| Usuário        | E-mail            | Senha      | Observações                                                               |
| -------------- | ----------------- | ---------- | ------------------------------------------------------------------------- |
| Ana Lima       | `ana@kurio.app`   | `kurio123` | Tem carteira principal (Ethereum) e secundária (Polygon) e três favoritos |
| Bruno Pinheiro | `bruno@kurio.app` | `kurio123` | Sem carteiras cadastradas, para exercitar o cadastro                      |

Qualquer cadastro novo funciona durante a sessão do browser. As senhas ficam em `localStorage` apenas como hash SHA-256.

Carteiras já cadastradas na conta da Ana, usadas no pagamento:

| Slot       | Apelido   | Rede     | Provedor | Endereço                                     |
| ---------- | --------- | -------- | -------- | -------------------------------------------- |
| Principal  | Principal | Ethereum | MetaMask | `0xA91F3c8E2b7D4a6F1e9C0b5A8d7E6f4C3b2A1E82` |
| Secundária | Reserva   | Polygon  | Coinbase | `0x5B2c9D1e7F4a3B6c8E0d2F1a9C7b5E3d4A6F8C21` |

Endereços Ethereum e Polygon precisam ser `0x` com 40 caracteres hexadecimais; Solana aceita 32 a 44 caracteres em base58. Qualquer valor nesse formato é aceito.

Cupons de desconto:

| Código    | Efeito                 |
| --------- | ---------------------- |
| `KURIO10` | 10% sobre o subtotal   |
| `GENESIS` | Responde como expirado |
| outro     | Responde como inválido |

Dados do catálogo úteis para testar:

- `Emerald Ape #042` (`/nft/emerald-ape-042`) é o primeiro card e o alvo das ações de preço do painel de simulação.
- `Sage Nomad #009` tem a edição 1/1 esgotada e a 1/10 com uma única unidade, para ver o limite do stepper e o bloqueio de compra.
- Cada NFT tem quatro edições (1/1, 1/10, 1/50 e aberta) com preços diferentes; o preço do card é o da edição 1/50.
- A taxa de rede da cotação é 0.016 ETH na Ethereum, 0.002 na Polygon e 0.001 na Solana, pela rede predominante no carrinho.

## Fluxo completo de compra

1. Na home, use busca, filtros, ordenação e paginação (tudo fica na URL) e abra um NFT.
2. No detalhe, escolha a edição e a quantidade e clique em "Comprar". Visitantes também podem montar o carrinho.
3. No carrinho, ajuste quantidades, aplique um cupom e clique em "Conectar e finalizar". Sem sessão, você vai ao login e volta para o pagamento com o carrinho preservado e fundido ao da conta.
4. No pagamento, os dados do colecionador vêm do perfil. Escolha uma carteira cadastrada (ou informe outra), selecione o provedor, clique em "Conectar carteira" (a conexão é simulada e leva 1,2 s) e confirme a compra.
5. O pedido fica pendente por 3 s e então aparece o recibo com hash e link para o explorador. Com o cenário `payment-rejected`, ele é recusado e os itens voltam a ficar disponíveis no carrinho.

Perfil, carteiras e favoritos ficam em `/perfil`, `/perfil/carteiras` e `/perfil/favoritos`. O coração nos cards e no detalhe exige sessão; sem ela, você é levado ao login e volta para onde estava.

## Cenários de simulação

Os mocks têm um cenário ativo que muda latência, falhas e comportamento dos fluxos. Dá para escolher de três formas:

- Pela URL: `http://localhost:5173/?scenario=slow-network`. O parâmetro é lido no boot, gravado em `localStorage` e removido da URL.
- Pelo painel de simulação, aberto com o atalho `Ctrl+.` em qualquer página (não há link visível; no celular use a URL). O painel também dispara eventos de tempo real manualmente e reseta os dados.
- Pelo endpoint interno `PUT /api/__mock/scenario` com `{ "name": "..." }`, que é o que os testes usam.

Para voltar ao estado inicial: `http://localhost:5173/?reset=1` ou o botão "Resetar dados simulados" no painel. O reset recria catálogo, usuários, carrinhos e pedidos e encerra a sessão.

| Cenário                    | Efeito                                                                         |
| -------------------------- | ------------------------------------------------------------------------------ |
| `default`                  | Latência de 100 a 250 ms, tudo funciona, pedido confirma em 3 s                |
| `slow-network`             | Toda requisição demora entre 2,5 e 4 s                                         |
| `variable-latency`         | Latência aleatória entre 50 ms e 3 s                                           |
| `out-of-order`             | No catálogo, a primeira busca de uma sequência demora mais que as seguintes    |
| `offline`                  | Todas as requisições falham com erro de rede                                   |
| `server-error`             | Catálogo e conteúdo respondem 503 nas três primeiras tentativas, depois voltam |
| `session-expired`          | A próxima requisição autenticada devolve 401 e encerra a sessão                |
| `register-conflict`        | Qualquer cadastro responde que o e-mail já está em uso                         |
| `coupon-expired`           | O cupom `KURIO10` passa a responder como expirado                              |
| `price-change-in-checkout` | Cinco segundos após conectar, o primeiro item do carrinho sobe 15%             |
| `edition-sold-out`         | Cinco segundos após conectar, a edição do primeiro item do carrinho esgota     |
| `order-timeout`            | O pedido é criado, mas a resposta só chega após 12 s                           |
| `payment-rejected`         | O pedido é recusado pela rede após 3 s                                         |
| `wallet-refused`           | A simulação de conexão da carteira termina recusada                            |
| `favorites-fail`           | Favoritar e desfavoritar respondem 503                                         |
| `empty-catalog`            | O catálogo responde sem nenhum NFT                                             |

### Reproduzindo os fluxos de falha

- Skeletons e lentidão: abra `/?scenario=slow-network` e navegue pelo catálogo, detalhe e carrinho.
- Erro com recuperação: abra `/?scenario=server-error`. O catálogo mostra o erro depois das tentativas automáticas; "Tentar novamente" recupera.
- Sessão expirada: entre com qualquer usuário, ative `session-expired` no painel e abra "Lista de interesse" no perfil. Você volta ao login com o destino preservado.
- Conflito de cadastro: ative `register-conflict` e tente criar uma conta.
- Cupom expirado: no carrinho, aplique `GENESIS`. Com `coupon-expired` ativo, `KURIO10` também expira.
- Preço alterado durante a compra: com itens no carrinho, ative `price-change-in-checkout` (ou use "Subir preço 15%" no painel). O resumo é atualizado e o banner avisa. Se o cliente não receber o evento, o "Confirmar compra" devolve uma cotação desatualizada e pede nova confirmação.
- Edição esgotada: `edition-sold-out` ou "Esgotar edição" no painel. O carrinho marca a linha e bloqueia o checkout.
- Timeout após criação do pedido: ative `order-timeout` e confirme a compra. O cliente aguarda 8 s, reenvia com a mesma chave de idempotência e recupera o mesmo pedido.
- Pagamento recusado: ative `payment-rejected` e confirme a compra. Os itens continuam no carrinho.
- Carteira recusada: ative `wallet-refused` e clique em "Conectar carteira" no pagamento.
- Queda de conexão com pedido pendente: logo após confirmar, use "Derrubar socket" no painel ou recarregue a página. O pedido é retomado sem criar outro.
- Falha ao favoritar: ative `favorites-fail` e clique no coração. O estado volta e um aviso aparece.

## Comandos

| Comando                | O que faz                                                   |
| ---------------------- | ----------------------------------------------------------- |
| `pnpm dev`             | Servidor de desenvolvimento com mocks                       |
| `pnpm build`           | Build de produção em `dist/`                                |
| `pnpm preview`         | Serve o build em `http://localhost:4173`                    |
| `pnpm typecheck`       | Verificação de tipos                                        |
| `pnpm lint`            | Lint com oxlint                                             |
| `pnpm test:unit`       | Testes unitários dos helpers (`node --test`)                |
| `pnpm test:e2e`        | Build e suíte Playwright em Chromium, desktop e mobile      |
| `pnpm test:e2e:ui`     | Mesma suíte com a interface do Playwright                   |
| `pnpm test:e2e:update` | Regenera os baselines de regressão visual                   |
| `pnpm lighthouse`      | Auditoria Lighthouse (3 medições por página e perfil)       |
| `pnpm mocks:init`      | Regenera `public/mockServiceWorker.js` após atualizar o MSW |

Os testes E2E sobem o preview do build automaticamente. O relatório HTML fica em `playwright-report/` e os traces das falhas em `test-results/`. Os baselines visuais em `e2e/visual.spec.ts-snapshots/` foram gerados em Linux; em outro sistema é preciso regenerá-los.

A auditoria Lighthouse escreve os relatórios em `lighthouse/reports/` e o resumo com medianas em `lighthouse/RESULTS.md`. A configuração está em `lighthouse/config.mjs`.

## Estrutura

```
src/
  api/          cliente Axios, contratos Zod e chaves de query
  routes/       rotas do TanStack Router (file-based)
  features/     catálogo, nft, carrinho, checkout, pedidos, auth, perfil, carteiras, tempo real, simulação
  components/   layout, campos de formulário, ícones e componentes shadcn adaptados
  mocks/        handlers MSW, banco em memória persistido, cenários e servidor Socket.IO simulado
  lib/          aritmética de ETH, storage, socket e utilitários
e2e/            specs Playwright e baselines visuais
lighthouse/     configuração, relatórios e resumo da auditoria
scripts/        gerador de fixtures e runner do Lighthouse
```

## Deploy

O projeto é uma SPA Vite. Na Vercel, basta importar o repositório com o framework Vite, build `pnpm build` e saída `dist`. O `vercel.json` já tem o rewrite para `index.html`, então acesso direto e refresh de qualquer rota funcionam. Os mocks vão junto no build, então a URL pública funciona sozinha, inclusive o tempo real.
