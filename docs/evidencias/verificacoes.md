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
