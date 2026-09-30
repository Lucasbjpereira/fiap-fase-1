# Oficina — Tech Challenge Fase 1

MVP backend para organizar clientes, veículos, serviços, estoque e ordens de serviço. A API permite criar o orçamento, registrar aprovação ou rejeição pelo cliente e acompanhar o progresso por um código público aleatório.

## Tecnologias e arquitetura

- Bun 1.3+, TypeScript, Elysia, PostgreSQL 17, Drizzle ORM e postgres.js.
- Monólito modular com DDD e Clean Architecture: `domain/` contém entidades, objetos de valor, invariantes e interfaces de repositório por agregado. `application/use-cases/` contém um caso de uso por ação. `infrastructure/repositories/` contém um adaptador PostgreSQL por repositório; `presentation/routes/` contém os adaptadores HTTP por módulo.
- A dependência segue de fora para dentro: as rotas chamam casos de uso, que dependem apenas de entidades e contratos. Leituras detalhadas da OS usam uma porta de consulta própria. `src/composition.ts` conecta os adaptadores e `PgUnitOfWork` executa os casos de uso transacionais.
- `src/infrastructure/in-memory/` implementa os mesmos contratos para testar casos de uso sem PostgreSQL. `InMemoryUnitOfWork` trabalha sobre uma cópia do estado e só a publica quando a operação termina com sucesso.
- PostgreSQL foi escolhido por manter relações e histórico com chaves estrangeiras, restrições e transações nos fluxos de OS e estoque.
- Elysia gera documentação OpenAPI em `/openapi`. As rotas administrativas usam JWT.

## Executar com Docker Compose

Pré-requisitos: Docker Desktop com Compose v2. Na raiz:

```bash
docker compose up --build
```

O Compose aguarda o healthcheck do banco. A API executa a migração e o seed ao iniciar. Endereços: API `http://localhost:3000`, saúde `http://localhost:3000/health`, OpenAPI/Scalar `http://localhost:3000/openapi` e especificação JSON `http://localhost:3000/openapi/json`. A porta do PostgreSQL publicada no host é 5432 para evitar conflito local; entre containers, a API usa 5432.

Credenciais fictícias locais: `admin@oficina.local` / `TroqueEstaSenha123!`. Troque-as antes de publicar ou compartilhar o ambiente. Para encerrar: `docker compose down`; para apagar também o banco local: `docker compose down -v`.

## Execução sem container para a API

Use Bun 1.3 ou superior e um PostgreSQL acessível. Copie `.env.example` para `.env`, ajuste `DATABASE_URL` e os segredos, então:

```bash
bun install
bun run db:migrate
bun run db:seed
bun run dev
```

## Autenticação e demonstração

Faça `POST /api/v1/auth/login` com JSON `{"email":"admin@oficina.local","password":"TroqueEstaSenha123!"}`. Envie o token retornado como `Authorization: Bearer <token>` nas rotas administrativas.

O seed cria a cliente Marina Souza (CPF fictício válido para teste), Honda Civic ABC1D23, serviços de troca de óleo/alinhamento e itens de estoque. Cadastre a oficina em `POST /api/v1/workshops` e consulte em `GET /api/v1/workshops/{id}`. Crie uma OS com IDs obtidos nas listagens. Para demonstrar todo o fluxo: mova a OS de `RECEIVED` para `DIAGNOSIS`, depois para `AWAITING_APPROVAL`; consulte o `trackingCode`; aprove em `/api/v1/public/work-orders/{trackingCode}/decision`; a aprovação baixa estoque e inicia execução. Para simular um reparo adicional, use `POST /api/v1/work-orders/{id}/items`: o sistema recalcula o orçamento e exige uma segunda aprovação antes de continuar. Finalize movendo a OS para `FINISHED` e `DELIVERED`.

## API e coleção Insomnia

Importe `docs/insomnia/oficina-insomnia.json` no Insomnia. O ambiente base `Local` usa `http://localhost:3000`; a coleção inclui requisições para os métodos documentados, exemplos e cenários de erro. Após o login, copie o JWT para `jwt`; após criar uma OS, copie `id` para `work_order_id` e `trackingCode` para `tracking_code`. A documentação interativa em `/openapi` é a referência dos schemas publicados.

## Testes e segurança

```bash
bun run test:memory
bun run test:coverage
bun run typecheck
bun run security:audit
```

`bun run test:memory` executa apenas os testes dos repositórios em memória e dos casos de uso; não precisa de Docker, PostgreSQL nem `DATABASE_URL`. Para escrever outro teste, chame `createInMemoryEnvironment()` de `src/infrastructure/in-memory/context.ts` e injete `repositories`, `unitOfWork` e `workOrderQueries` nos casos de uso. Cada chamada cria um estado isolado.

```ts
const { repositories, unitOfWork, workOrderQueries } = createInMemoryEnvironment();
const createCustomer = new CreateCustomer(repositories.customers);
const customer = await createCustomer.execute({ name: 'Marina Souza', document: '52998224725' });
// Injete unitOfWork nos casos de uso transacionais e workOrderQueries nas consultas.
```

O limiar de cobertura configurado é 80% em linhas e funções sobre domínio e casos de uso quando `test:coverage` é executado. Os testes integrados ficam habilitados ao executar `RUN_INTEGRATION=true DATABASE_URL=postgres://oficina:oficina_local@localhost:5432/oficina bun run test:coverage` com Docker Compose ativo e banco migrado/populado. O resultado observado está em [relatório de auditoria](docs/security/dependency-audit.md) e [verificações executadas](docs/evidencias/verificacoes.md).

## Estrutura

```text
src/domain/<agregado>/            entidade e interface do seu repositório
src/domain/shared/                objetos de valor e erro de domínio
src/application/use-cases/<area>/ um arquivo por caso de uso
src/application/unit-of-work.ts   contrato de transação
src/application/work-order-queries.ts  porta de leitura da OS
src/infrastructure/repositories/  um adaptador PostgreSQL por repositório
src/infrastructure/queries/       consultas de leitura da OS
src/infrastructure/database/      DAO SQL, Unit of Work, schema, migração e seed
src/infrastructure/in-memory/     adaptadores, consultas e Unit of Work em memória
src/presentation/routes/          rotas Elysia por módulo
src/presentation/presenters.ts    mapeamento de entidades para respostas HTTP
src/composition.ts                composição das dependências
migrations/                       SQL versionado
tests/                            testes integrados e sem banco
docs/ddd/                         Event Storming e linguagem ubíqua
docs/insomnia/                    coleção exportada
docs/video/                       roteiro de demonstração
docs/entrega/                     modelo preenchível do PDF final
docs/security/                    relatório de análise de dependências
docs/evidencias/                  resultados observados de execução
.agents/skills/                   instruções reutilizáveis do projeto
```

## DDD e entrega acadêmica

Veja [documentação DDD](docs/ddd/README.md), [roteiro do vídeo](docs/video/roteiro.md) e [modelo de entrega](docs/entrega/modelo.md). Preencha os campos de grupo, integrantes, RMs, Discord, URLs, branch/tag e hash final. O Event Storming pode ser montado em Miro ou equivalente; mantenha uma exportação versionada aqui e libere o link externo para visualização sem solicitação de acesso.

## Limitações atuais do MVP

- A API cobre operações principais; faltam paginação/filtros em algumas listagens e atualização de todos os campos em todos os recursos.
- A rejeição é registrada sem um estado próprio (o desafio não define um estado de rejeição); a OS continua aguardando decisão para permitir nova decisão após ajuste do orçamento.
- Não há integração real de notificações. O cliente consulta o orçamento e progresso pela API.
- O grupo ainda precisa preencher dados acadêmicos, criar o Event Storming externo, publicar o repositório e gravar/publicar o vídeo da entrega.
