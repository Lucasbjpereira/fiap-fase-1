---
name: oficina-backend
description: Implement and maintain the auto repair shop backend in Bun, Elysia, TypeScript, PostgreSQL, and layered DDD. Use for API, domain, persistence, security, and business-flow changes in this project.
---

# Backend da oficina

Keep this project as a modular monolith. Put business invariants in domain/application code, not route handlers. Read the root README and `docs/ddd/` before changing a business flow.

## Project decisions

- Use Bun, TypeScript, Elysia, PostgreSQL, Drizzle ORM, and postgres.js.
- Keep HTTP concerns in `src/presentation/routes/`, one action per file in `src/application/use-cases/<area>/`, entities/value objects/repository interfaces in `src/domain/<aggregate>/`, and PostgreSQL adapters in `src/infrastructure/repositories/`.
- Create a distinct repository interface and adapter for each aggregate. Compose dependencies only in `src/composition.ts`. Execute parameterized SQL through `src/infrastructure/database/postgres-dao.ts` and transactions through `PgUnitOfWork`. Keep business decisions in domain entities and focused use cases.
- Prefer explicit domain actions such as `rename`, `changePrice`, `activate`, `receiveStock`, and `withdrawStock` over generic entity patch methods. Update use cases should call the relevant actions for supplied fields.
- Administrative endpoints require JWT. Public tracking endpoints use the opaque tracking code and return only customer-safe fields.
- Use database transactions for order creation, approval, status changes, and stock movements.
- Keep `src/infrastructure/in-memory/` aligned with the repository contracts and transaction behavior when changing a use case or aggregate; use `bun run test:memory` for fast database-free feedback.
- Preserve status history and reject transitions not allowed by the domain.
- Validate CPF/CNPJ and Brazilian vehicle plates at the boundary and in domain value objects where relevant.
- Keep secrets in environment variables; update `.env.example` only with safe placeholders.

## Workflow

1. Inspect related route, use case, domain types, persistence schema, migration, tests, and DDD notes.
2. Implement the smallest coherent change across those layers; update migrations when persistence changes.
3. Add or update unit and integration tests for successful and rejected paths.
4. Keep OpenAPI schemas and `docs/insomnia/` examples aligned with the actual API.
5. Run relevant Bun checks and report exact results; do not claim unrun checks passed.
