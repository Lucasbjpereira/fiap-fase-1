# Quadro → implementação

## Comandos principais

| Comando / intenção | Handler (src/application/use-cases/) | Comportamento | Porta HTTP existente |
|---|---|---|---|
| Receber OS | work-order/create-work-order.ts | WorkOrder.create | POST /api/v1/work-orders |
| Iniciar diagnóstico | work-order/start-diagnosis.ts | startDiagnosis | POST /work-orders/:id/status — DIAGNOSIS |
| Apresentar orçamento | work-order/submit-quote.ts | submitQuote | POST /work-orders/:id/status — AWAITING_APPROVAL |
| Aprovar orçamento | work-order/approve-quote.ts | approveQuote + Part.consumeForWorkOrder | POST /public/work-orders/:trackingCode/decision — approved=true |
| Rejeitar orçamento | work-order/reject-quote.ts | rejectQuote | POST /public/work-orders/:trackingCode/decision — approved=false |
| Propor adicional | work-order/propose-additional-repair.ts | proposeAdditionalRepair | POST /work-orders/:id/items |
| Finalizar reparo | work-order/finish-repair.ts | finishRepair | POST /work-orders/:id/status — FINISHED |
| Registrar entrega | work-order/record-delivery.ts | recordDelivery | POST /work-orders/:id/status — DELIVERED |
| Receber estoque | part/receive-stock.ts | recordReceipt | POST /parts/:id/movements — delta positivo |
| Retirar estoque | part/withdraw-stock.ts | recordWithdrawal | POST /parts/:id/movements — delta negativo |
| Cadastrar/atualizar/desativar | customer/, vehicle/, service/, part/, workshop/ | ações específicas da raiz | rotas CRUD correspondentes |

As portas abreviadas possuem o prefixo `/api/v1`. Os formatos antigos de status/decision/movements permanecem; adaptadores direcionam cada intenção para seu handler. Papéis técnicos e estoquista são atores do negócio, não permissões adicionais já implementadas no JWT.

## Eventos com envelope

| IDs | Evento(s) | Origem no domínio |
|---|---|---|
| E01/E02 | WorkOrderReceived, QuoteCalculated | WorkOrder.create |
| E03 | DiagnosisStarted | startDiagnosis |
| E04 | QuoteSubmitted | submitQuote e proposeAdditionalRepair |
| E05/E07 | QuoteApproved, ExecutionStarted | approveQuote, primeira execução |
| E06 | QuoteRejected | rejectQuote |
| E08/E09/E10 | AdditionalRepairProposed, ExecutionPaused, QuoteRevised | proposeAdditionalRepair |
| E11 | ExecutionResumed | approveQuote após execução anterior |
| E12 | RepairFinished | finishRepair |
| E13 | VehicleDelivered | recordDelivery |
| E14 | StockReceived | Part.recordReceipt |
| E15 | StockWithdrawn | Part.recordWithdrawal |
| E16 | PartsConsumed | Part.consumeForWorkOrder |
| E17 | MinimumStockReached | cruzamento do limite em saída/consumo |

`src/domain/shared/domain-event.ts` tipa os nomes; `application/domain-event-store.ts` define a porta; `infrastructure/database/domain-event-store.ts` e `infrastructure/in-memory/domain-event-store.ts` implementam o registro. `migrations/0003_domain_model.sql` adiciona versões e tabela de eventos.

Na aprovação, todos os fatos são confirmados pelo mesmo commit. A ordem de gravação não substitui um workflow distribuído; não existe subscriber que reaja a QuoteApproved. O handler coordena explicitamente as operações.

## Consultas / modelos de leitura

| Modelo | Código | Uso |
|---|---|---|
| Cliente e veículos | GetCustomer, ListCustomers, GetVehicle, ListVehicles | escolher cliente/veículo e conferir vínculo |
| Catálogo de serviços | GetService, ListServices | selecionar serviço ativo e preço |
| Catálogo/saldo de peças | GetPart, ListParts | conferir saldo/mínimo e disponibilidade |
| Histórico de movimentos | ListPartMovements | auditar entradas/saídas |
| Fila de OS | ListWorkOrders + WorkOrderQueries.list | selecionar OS por status |
| Detalhe administrativo | GetWorkOrder + detail | itens, orçamento, decisões e histórico |
| Orçamento/progresso público | TrackWorkOrder + publicView | cliente consulta versão, total e itens antes de decidir |
| Histórico de status | GetWorkOrderHistory + history | explicar mudanças ao longo do tempo |
| Tempo médio | GetAverageExecutionTime | análise operacional |

Leituras são síncronas do estado persistido, com adaptadores PgWorkOrderQueries e InMemoryWorkOrderQueries. Não são projeções reconstruídas a partir do log de eventos.

## Repositórios

Cada raiz possui contrato em `src/domain/<conceito>/*-repository.ts`, adaptador PostgreSQL em `src/infrastructure/repositories/` e adaptador em memória em `src/infrastructure/in-memory/`. Ambos usam os mesmos casos de uso. WorkOrderRepository só expõe find/save; não oferece alteração isolada de saldo do orçamento, consumo de item, decisão ou histórico.


## Migração de dados existentes

A migração 0003 mantém as tabelas existentes e acrescenta colunas de versão. Para OS anteriores, reconstrói a revisão pelo histórico de transições IN_PROGRESS → AWAITING_APPROVAL e associa decisões por timestamp; esse backfill roda uma única vez. A reconstrução depende da integridade do histórico anterior e não recria eventos que nunca foram registrados. Novas decisões sempre persistem a versão explícita do agregado.
