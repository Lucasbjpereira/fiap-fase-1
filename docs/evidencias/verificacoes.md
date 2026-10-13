# Verificações executadas

Execuções registradas em 2026-09-28 e 2026-09-29, após a reconstrução da arquitetura DDD:

| Verificação | Resultado |
|---|---|
| `bun run typecheck` | Aprovado, sem erros TypeScript. |
| `bun run test:memory` | 2 testes passaram; 0 falharam. Casos de uso de cadastros, autenticação e fluxo de OS rodaram sem PostgreSQL; aprovação com estoque insuficiente comprovou rollback de estoque, decisão e status. |
| `RUN_INTEGRATION=true DATABASE_URL=postgres://oficina:oficina_local@localhost:5432/oficina bun run test:coverage` | 16 testes passaram; 0 falharam. Inclui os testes em memória, regras de domínio e testes de integração contra PostgreSQL ativo. |
| Cobertura dos arquivos de domínio e aplicação | 99,83% de linhas e 100% de funções; limiar configurado de 80%. `application/errors.ts` foi excluído da medição por conter somente o tipo de erro e sua construção; o mapeamento HTTP de erros está na camada `presentation`, também fora desse limiar. |
| `bun run security:audit` | Nenhuma vulnerabilidade reportada nas dependências; ver `docs/security/dependency-audit.md`. |
| `docker compose up --build -d` | Build da arquitetura DDD concluído em 2026-09-29; API iniciou e `/health` respondeu 200 com PostgreSQL conectado. |
| Fluxo via API no container | Login, consulta de catálogos, criação do orçamento usando CPF, transições, consulta pública, aprovação, reparo adicional com novo orçamento/aprovação, baixa correta de estoque, finalização e entrega passaram. |
| Swagger e autenticação | `/openapi` respondeu 200; rota administrativa sem JWT respondeu 401. |
| CORS | Preflight para `http://localhost:5173` retornou a origem configurada. |
| Coleção Insomnia | JSON válido; 43 requisições abrangem as 35 operações atualmente publicadas no OpenAPI, incluindo as duas rotas de oficina. |

Os testes de integração só são executados com `RUN_INTEGRATION=true`; sem essa variável, Bun os marca como ignorados e executa os testes unitários. `test:memory` executa isoladamente em `tests/` sem ler a configuração de cobertura do projeto.


## Revisão de DDD e Event Storming — 02/10/2026

- Oito etapas em SVG/Mermaid/Markdown e visualizador offline em `docs/ddd/event-storming/index.html`; rota local `/event-storming/`.
- Persistência completa do agregado WorkOrder; handlers separados para diagnóstico, apresentação, aprovação, rejeição, adicional, finalização e entrega.
- VOs Quote/QuoteVersion/StockBalance e igualdade/congelamento dos VOs existentes; saldo alterado por comportamento de Part.
- Eventos de OS e estoque registrados no mesmo UnitOfWork da mudança, tanto PostgreSQL quanto in-memory.
- `bun run typecheck`: concluído sem erros.
- `bun run test:memory`: 2 testes passaram. Verificação de rollback dos eventos e estoque; rejeição; versão antiga; retomada sem consumo duplicado.
- `RUN_INTEGRATION=true DATABASE_URL=postgres://oficina:oficina_local@localhost:5432/oficina bun run test:coverage`: 18 testes passaram, nenhum erro; 99,86% de linhas e 100% de funções nos arquivos incluídos no relatório. Infraestrutura e apresentação são excluídas da medição, mas os quatro testes de API exercitam os adaptadores PostgreSQL.
- Na primeira execução integrada foi detectado erro de serialização de Date no DAO. A conversão para ISO resolveu o erro; a suíte integrada foi executada novamente com sucesso.
- Docker Compose reconstruído; migração 0003 e seed aplicados; `/health` e `/event-storming/` retornaram HTTP 200.
- Revisão visual no navegador: navegação entre etapas 4 e 7, renderização de post-its/legenda, entidades/VOs, escala legível e ajuste de largura.
- A coleção Insomnia foi atualizada com `quote_version`; não foi importada manualmente no aplicativo nesta revisão.
- Não houve nova análise de vulnerabilidades nesta revisão. Não há publicação de link externo, broker, Event Sourcing, notificações ou suporte multiunidade.
