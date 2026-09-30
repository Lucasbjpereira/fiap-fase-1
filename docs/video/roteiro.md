# Roteiro de vídeo (até 15 minutos)

Prepare o Compose antes de gravar, use os dados fictícios do seed e deixe a coleção Insomnia aberta. O roteiro abaixo soma aproximadamente 13 minutos e deixa margem para transições.

| Tempo | Demonstração |
|---|---|
| 0:00–0:45 | Integrantes, curso/grupo e problema que a oficina precisa resolver. |
| 0:45–2:15 | README, estrutura do monólito e separação domain/infrastructure/presentation. |
| 2:15–3:15 | PostgreSQL, justificativa e Docker Compose; mostrar containers saudáveis. |
| 3:15–4:30 | Event Storming e linguagem ubíqua em `docs/ddd/`; explicar eventos e regras. |
| 4:30–5:15 | Abrir `/openapi` e fazer login administrativo pelo Insomnia. |
| 5:15–7:00 | Mostrar cliente, veículo, serviços e peças de demonstração; consultar estoque. |
| 7:00–9:15 | Criar OS com serviços/peças; mostrar orçamento e código público. |
| 9:15–10:30 | Mover a OS para diagnóstico e aprovação; abrir consulta pública, aprovar e mostrar baixa de estoque. |
| 10:30–11:30 | Finalizar e entregar OS; mostrar histórico e endpoint de acompanhamento. |
| 11:30–12:30 | Mostrar cálculo do tempo médio de execução. |
| 12:30–13:30 | Rodar testes/cobertura e mostrar resultado real do scanner de dependências. |
| 13:30–14:15 | Encerrar com limitações conhecidas e versão (branch/hash) que será avaliada. |

## Sequência de requisições Insomnia

1. `Auth / Login`; copiar `token` para `jwt` no ambiente.
2. `Customers / List` e `Vehicles / List`; anotar IDs do seed.
3. `Services / List` e `Parts / List`; anotar IDs e saldo.
4. `Work orders / Create` usando esses IDs; copiar `trackingCode` retornado.
5. `Work orders / Change status` para `DIAGNOSIS`, depois `AWAITING_APPROVAL`.
6. `Public / Track work order`, depois `Public / Approve quote`.
7. `Work orders / Detail`; demonstrar decisão, status e histórico; avançar para `FINISHED`, depois `DELIVERED`.
8. `Metrics / Average execution time`.

Use uma OS recém-criada a cada ensaio para evitar inconsistência de estado ou saldo entre gravações. O áudio deve identificar todos os integrantes e explicar Event Storming, regras e escolhas, além de navegar pela tela.
