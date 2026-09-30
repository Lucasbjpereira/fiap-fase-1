---
name: oficina-ddd
description: Create or update this workshop system's Event Storming, domain language, and DDD documentation so it matches implemented behavior. Use for domain modeling or DDD deliverables.
---

# DDD e Event Storming da oficina

Read `docs/ddd/` and the corresponding use cases/domain code before editing domain diagrams. Treat the delivered implementation as the source of truth; if a business rule is undecided, record the open question instead of drawing an invented rule as fact.

Document the three required flows: OS creation, OS tracking, and parts/consumables management. Show actors, commands, domain events, policies, aggregates, entities, value objects, and bounded contexts where useful. Keep the ubiquitous language and glossary in Brazilian Portuguese and map concepts to code modules/use cases.

Give repositories to aggregate roots. WorkOrderItem, QuoteDecision, and StatusChange are entities/value-bearing records owned by WorkOrder; InventoryMovement belongs to the Part history. Persist them through the owning aggregate repository instead of inventing independent repositories that would allow bypassing aggregate invariants.

Use versionable Mermaid diagrams and Markdown. Keep the diagrams readable and exportable to PDF or images for the academic repository. Update documentation alongside behavior changes and check that transition names, approval rules, and inventory behavior match code and API.
