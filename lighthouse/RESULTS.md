# Lighthouse

Medições em 2026-10-14T12:32:55.570Z com build de produção (`pnpm build && pnpm preview`), mocks ativos no cenário padrão, 3 execuções por página e perfil após uma execução de aquecimento para registrar o service worker. Os valores abaixo são a mediana de cada categoria e métrica.

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| / | mobile | **69** | 100 | 100 | 100 | 4601 ms | 0.000 | 295 ms |
| / | desktop | 99 | 100 | 100 | 100 | 843 ms | 0.000 | 0 ms |
| /nft/emerald-ape-042 | mobile | **75** | 100 | 100 | 100 | 4395 ms | 0.000 | 136 ms |
| /nft/emerald-ape-042 | desktop | 98 | 100 | 100 | 100 | 919 ms | 0.000 | 0 ms |

Metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90. Valores em negrito ficaram abaixo da meta.

## Execuções individuais

### / (mobile)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 71 | 100 | 100 | 100 | 4561 ms | 0.000 | 248 ms |
| 2 | 66 | 100 | 100 | 100 | 4601 ms | 0.000 | 380 ms |
| 3 | 69 | 100 | 100 | 100 | 4646 ms | 0.000 | 295 ms |

### / (desktop)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 99 | 100 | 100 | 100 | 845 ms | 0.000 | 0 ms |
| 2 | 99 | 100 | 100 | 100 | 832 ms | 0.000 | 0 ms |
| 3 | 99 | 100 | 100 | 100 | 843 ms | 0.000 | 0 ms |

### /nft/emerald-ape-042 (mobile)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 75 | 100 | 100 | 100 | 4395 ms | 0.000 | 136 ms |
| 2 | 75 | 100 | 100 | 100 | 4449 ms | 0.000 | 129 ms |
| 3 | 75 | 100 | 100 | 100 | 4374 ms | 0.000 | 164 ms |

### /nft/emerald-ape-042 (desktop)

| # | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 98 | 100 | 100 | 100 | 919 ms | 0.000 | 0 ms |
| 2 | 99 | 100 | 100 | 100 | 918 ms | 0.000 | 0 ms |
| 3 | 98 | 100 | 100 | 100 | 930 ms | 0.000 | 0 ms |

## Ambiente

- Lighthouse 13.5.0, Chromium 156.0.8078.4 (headless, binário do Playwright)
- Node v24.18.0, Linux 6.18.54.1-microsoft-standard-WSL2 (x64), 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz × 6
- Perfil mobile: emulação padrão do Lighthouse (Moto G Power, throttling simulado 4G lento, CPU 4x)
- Perfil desktop: preset `desktopConfig` do Lighthouse (1350×940, sem throttling de CPU, rede 10 Mbps)
- Configuração versionada em `lighthouse/config.mjs`; relatórios HTML e JSON em `lighthouse/reports/`
- Comando: `pnpm lighthouse` (variável `LH_RUNS` altera o número de execuções)
