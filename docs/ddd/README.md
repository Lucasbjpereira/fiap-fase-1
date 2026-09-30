# DDD — Sistema da oficina

Esta modelagem inicial descreve o MVP implementado. O grupo deve validar o Event Storming com todos os integrantes e exportar o quadro colaborativo para PDF ou imagem nesta pasta. O link externo compartilhável deve ser preenchido em `docs/entrega/modelo.md`.

## Linguagem ubíqua

| Termo | Significado neste projeto | Implementação |
|---|---|---|
| Ordem de Serviço (OS) | Registro do atendimento e execução de reparo de um veículo | `work_orders`, rotas `/work-orders` |
| Orçamento | Soma dos serviços e peças cadastrados como itens da OS | `quote_total_cents`, `order_items` |
| Código de acompanhamento | Segredo aleatório entregue ao cliente para consulta pública limitada | `work_orders.tracking_code` |
| Peça/insumo | Item controlado em estoque e usado em uma OS | `parts`, `inventory_movements` |
| Decisão do orçamento | Aprovação ou rejeição registrada pelo cliente | `quote_decisions` |
| Histórico de status | Eventos de transição da OS em ordem cronológica | `status_history` |

## Event Storming: criação da OS

```mermaid
flowchart LR
  A[Atendente] --> C1[Registrar atendimento]
  C1 --> E1((OS recebida))
  E1 --> P1[Validar cliente e veículo]
  P1 --> C2[Registrar diagnóstico]
  C2 --> E2((OS em diagnóstico))
  E2 --> C3[Adicionar serviços e peças]
  C3 --> P2[Calcular orçamento e verificar estoque]
  P2 --> E3((Orçamento disponibilizado))
  E3 --> E4((Aguardando aprovação))
```

## Event Storming: acompanhamento e decisão

```mermaid
flowchart LR
  A[Cliente] --> C1[Consultar pelo código]
  C1 --> E1((Progresso consultado))
  A --> C2[Aprovar ou rejeitar orçamento]
  C2 --> P1{Decisão}
  P1 -->|Aprovar| E2((Orçamento aprovado))
  E2 --> P2[Baixar estoque em transação]
  P2 --> E3((OS em execução))
  P1 -->|Rejeitar| E4((Orçamento rejeitado e registrado))
  T[Equipe técnica] --> C3[Finalizar serviço]
  C3 --> E5((OS finalizada))
  E5 --> C4[Registrar entrega]
  C4 --> E6((OS entregue))
```

## Event Storming: peças e insumos

```mermaid
flowchart LR
  A[Administrador] --> C1[Registrar entrada/ajuste]
  C1 --> P1[Validar saldo não negativo]
  P1 --> E1((Movimentação registrada))
  E1 --> E2((Saldo atualizado))
  O[Orçamento aprovado] --> C2[Consumir peças da OS]
  C2 --> P2[Conferir disponibilidade em transação]
  P2 --> E3((Saída vinculada à OS))
  P2 -->|Sem saldo| E4((Aprovação não concluída))
```

## Modelo de domínio

- **Atores:** cliente, atendente/administrador e equipe técnica.
- **Agregado principal:** Ordem de Serviço, com itens, orçamento, decisões e histórico encapsulados pela entidade `WorkOrder`.
- **Agregado de estoque:** Peça, com saldo e movimentações. A saída é atômica no banco para evitar saldo negativo.
- **Entidades implementadas:** Cliente, Veículo, Serviço, Peça, Oficina, Usuário administrativo, Ordem de Serviço, Item de OS, Decisão de orçamento, Mudança de status e Movimentação de estoque.
- **Objetos de valor implementados:** CPF/CNPJ (`TaxDocument`), Placa (`VehiclePlate`), Dinheiro em centavos (`Money`), Quantidade (`Quantity`) e Código de acompanhamento (`TrackingCode`).
- **Bounded contexts:** Atendimento e OS; Catálogo e Estoque; Identidade administrativa. São módulos lógicos dentro do monólito.
- **Políticas:** só veículo do cliente pode entrar na OS; orçamento é calculado pelos preços atuais no momento da criação; estoque é debitado na aprovação; reparos adicionais atualizam o orçamento e exigem nova aprovação, debitando somente itens ainda não consumidos; saldo não pode ficar negativo; transições inválidas são recusadas.

## Relação com o código

| Agregado ou módulo | Entidade raiz | Dados internos | Contrato de persistência | Adaptador |
|---|---|---|---|---|
| Clientes | `Customer` | `TaxDocument` | `CustomerRepository` | `PgCustomerRepository` |
| Veículos | `Vehicle` | `VehiclePlate` | `VehicleRepository` | `PgVehicleRepository` |
| Catálogo de serviços | `Service` | `Money` | `ServiceRepository` | `PgServiceRepository` |
| Estoque | `Part` | `InventoryMovement`, `Money` | `PartRepository` | `PgPartRepository` |
| Oficina | `Workshop` | `TaxDocument` | `WorkshopRepository` | `PgWorkshopRepository` |
| Ordens de serviço | `WorkOrder` | `WorkOrderItem`, `QuoteDecision`, `StatusChange`, `TrackingCode`, `Quantity`, `Money` | `WorkOrderRepository` | `PgWorkOrderRepository` |
| Identidade | `AdminUser` | credencial criptografada | `AdminUserRepository` | `PgAdminUserRepository` |

Os repositórios representam raízes de agregados. Itens, decisões, alterações de status e movimentações são persistidos pelo repositório da raiz que protege suas invariantes. As projeções de consulta e a métrica de tempo médio usam `WorkOrderQueries`, uma porta de leitura da aplicação, separada do contrato de escrita do agregado.

As alterações do estado passam por métodos com intenção explícita: `Customer.rename/changeEmail/changePhone`, `Vehicle.changeBrand/changeModel/changeYear`, `Service.changePrice/changeEstimatedMinutes/activate/deactivate` e `Part.changeMinimumStock/receiveStock/withdrawStock`. Os casos de uso de atualização aplicam somente as ações presentes na requisição antes de salvar a entidade.

```mermaid
flowchart LR
  HTTP[Rotas HTTP por módulo<br/>presentation/routes] --> UC[Um caso de uso por ação<br/>application/use-cases]
  UC --> D[Entidades e objetos de valor<br/>domain]
  UC --> P[Interfaces por agregado<br/>domain]
  R[Adaptador PostgreSQL por agregado<br/>infrastructure/repositories] -. implementa .-> P
  M[Adaptador em memória por agregado<br/>infrastructure/in-memory] -. implementa .-> P
  UOW[Unidade de trabalho<br/>application] -. implementada por .-> PGUOW[PgUnitOfWork]
  UC --> UOW
  R --> DAO[DAO SQL parametrizado]
  DAO --> DB[(PostgreSQL)]
```

- `src/domain/` possui uma pasta por conceito: `customer`, `vehicle`, `service`, `part`, `workshop`, `work-order` e `identity`. Cada agregado possui entidade e contrato do repositório; objetos de valor estão em `shared`.
- `src/application/use-cases/` possui arquivos separados para criar, consultar, listar, atualizar, excluir/desativar e para os fluxos de OS. Casos de uso transacionais recebem `UnitOfWork`; consultas detalhadas recebem a porta `WorkOrderQueries`.
- `src/infrastructure/repositories/` possui um adaptador por repositório. `src/infrastructure/queries/` implementa as projeções de leitura da OS. `src/infrastructure/database/postgres-dao.ts` executa SQL parametrizado e `pg-unit-of-work.ts` compartilha a mesma transação entre adaptadores.
- `src/infrastructure/in-memory/` possui um adaptador por repositório, projeções de leitura e uma unidade de trabalho em memória. Um caso de uso recebe exatamente os mesmos contratos nos dois ambientes; a unidade de trabalho descarta o estado da transação quando ocorre uma exceção.
- `src/presentation/routes/` adapta HTTP, autenticação e schemas. `src/presentation/presenters.ts` traduz entidades para respostas; `src/composition.ts` faz a ligação entre as camadas.

O grupo deve comparar este material com o quadro Miro final e atualizar os diagramas se as decisões do Event Storming mudarem.
