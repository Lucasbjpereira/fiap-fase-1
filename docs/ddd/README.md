# DDD e Event Storming — Oficina

A modelagem evolui em **oito etapas separadas**, acompanhadas pelo código. O objetivo é explicar o negócio, justificar os limites dos agregados e demonstrar como as intenções chegam aos comportamentos implementados.

## Abrir os quadros

- Com a API: **http://localhost:3000/event-storming/**.
- Sem API/rede: abra `event-storming/index.html` no navegador. O visualizador contém os oito SVGs embutidos e não depende de CDN.
- Cada etapa possui SVG independente, fonte Mermaid e explicação Markdown. Use zoom e barras de rolagem para explorar os quadros; a impressão usa a etapa selecionada.
- Regerar após editar o catálogo de origem em `scripts/generate-event-storming.py`: `python3 scripts/generate-event-storming.py`. O script produz `catalogo.json`, SVGs, Mermaid e HTML de forma determinística no conteúdo do quadro.

| Etapa | Objetivo | Material |
|---|---|---|
| 1 | Levantar fatos antes de organizar | [Descoberta livre](event-storming/01-descoberta.md) |
| 2 | Organizar o caminho e as alternativas no tempo | [Linha do tempo](event-storming/02-linha-do-tempo.md) |
| 3 | Identificar dúvidas, riscos e decisões | [Pontos de atenção](event-storming/03-pontos-de-atencao.md) |
| 4 | Marcar mudanças de fase do processo | [Eventos pivotais](event-storming/04-eventos-pivotais.md) |
| 5 | Identificar quem pede o quê | [Atores e comandos](event-storming/05-atores-e-comandos.md) |
| 6 | Mostrar informações para decidir e políticas | [Leituras e políticas](event-storming/06-leituras-e-politicas.md) |
| 7 | Definir consistência, raízes, entidades e VOs | [Agregados](event-storming/07-agregados.md) |
| 8 | Delimitar linguagem, responsabilidade e integração | [Bounded contexts](event-storming/08-bounded-contexts.md) |

Os três fluxos do desafio estão presentes: criação da OS; acompanhamento e decisão sobre orçamento; gerenciamento de peças e insumos. O quadro inclui 29 fatos: 17 tipos de eventos com envelope registrado e 12 fatos de cadastro cujo estado é persistido sem envelope próprio. Não tratamos consultas, falhas ou funcionalidades futuras como eventos de sucesso já implementados.

## Notação e conceitos

| Sigla/cor | Conceito | Significado |
|---|---|---|
| EV / amarelo | Evento de domínio | Algo ocorrido, nomeado no passado. E01–E17 são `DomainEvent`; C01–C12 são fatos de cadastro sem registro em `domain_events`. |
| CMD / azul turquesa | Comando | Intenção que pode ser aceita ou rejeitada: aprovar orçamento, finalizar reparo. |
| AT / amarelo claro | Ator | Papel que inicia uma ação: cliente, atendente, equipe técnica, estoquista. A API administrativa usa um único papel JWT no MVP. |
| ML / verde | Modelo de leitura | Informação para decidir: orçamento público, fila de OS, saldo e movimentos. |
| POL / lilás | Política | Regra/condição que orienta uma decisão ou reação. É síncrona neste monólito; não há consumidor automático de mensagens. |
| PA / rosa | Ponto de atenção | Dúvida ou risco. O catálogo declara a decisão tomada ou o que permanece aberto. |
| D / losango lilás | Decisão | Ramificação do processo, como aprovar ou rejeitar. |
| AG / amarelo claro | Agregado | Unidade de consistência protegida pela raiz; não é uma camada ou uma tabela. |
| ENT / azul claro | Entidade | Tem identidade e continuidade, como `WorkOrderItem` dentro da OS. |
| VO / lavanda | Objeto de valor | Não tem identidade própria; é validado, imutável e comparado por conteúdo. |
| ★ / borda espessa | Evento pivotal | Fato que muda a fase do processo. |

**Fluxo de execução:** ator usa leitura → envia comando → handler carrega raiz → comportamento valida invariantes → repositório persiste agregado → eventos são registrados na mesma transação. A entidade interna não envia comandos HTTP para sua raiz; o comportamento da raiz controla seus filhos.

## Linguagem ubíqua

| Termo | Significado no projeto | Código |
|---|---|---|
| OS | Atendimento/reparo de um veículo de um cliente | `WorkOrder` |
| Orçamento | Total dos snapshots de preço e quantidade dos itens de uma versão | `Quote`, `Money`, `QuoteVersion` |
| Decisão | Aceite/rejeição de uma versão e de seu total | `QuoteDecision` |
| Reparo adicional | Novo item durante execução que pausa a OS e pede nova aprovação | `proposeAdditionalRepair` |
| Peça/insumo | Item de catálogo com saldo controlado | `Part`, `StockBalance` |
| Consumo | Saída vinculada a uma OS aprovada | `consumeForWorkOrder`, `InventoryMovement` |
| Acompanhamento | Consulta pública limitada pelo código imprevisível | `TrackingCode`, `WorkOrderQueries.publicView` |
| Tempo de execução | Primeira aprovação até finalização, incluindo pausas | `averageExecutionMinutes` |

Veja [modelo tático](modelo-tatico.md), [decisões](decisoes.md) e [rastreabilidade](rastreabilidade.md) para os detalhes e caminhos de código.

## Fontes conceituais

A nomenclatura segue [EventStorming](https://www.eventstorming.com/), a explicação de [eventos pivotais por Alberto Brandolini](https://www.avanscoperta.it/en/eventstorming/pivotal-events/) e as definições de [agregado](https://martinfowler.com/bliki/DDD_Aggregate.html), [objeto de valor](https://martinfowler.com/bliki/ValueObject.html) e [bounded context](https://martinfowler.com/bliki/BoundedContext.html). As decisões da oficina são decisões deste projeto.

## Entrega externa

Este é um artefato local/versionado de modelagem, preparado a partir dos requisitos e implementação; não é evidência de uma sessão colaborativa já realizada. O grupo deve validar o quadro, importar/exportar em Miro ou equivalente e preencher o link compartilhável em `docs/entrega/modelo.md`. A implementação não publica links externos automaticamente.
