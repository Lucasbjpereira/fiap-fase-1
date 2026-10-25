# Análise de vulnerabilidades de dependências

- Evidência registrada em: 2026-09-28.
- Ferramenta: Bun 1.3.8 (`bun audit`).
- Escopo: dependências declaradas no `package.json` e lockfile `bun.lock`.
- Resultado observado: `No vulnerabilities found` (código de saída 0).

Esse resultado é histórico e descreve apenas as dependências naquele momento. O workflow `Dependency audit` executa a verificação em pull requests para `main`, em pushes para `main` e manualmente; cada execução preserva a saída como artefato por 14 dias. Consulte a execução mais recente antes da entrega final.

Em 2026-10-25, uma nova execução local identificou a vulnerabilidade GHSA-mrhx-c7xc-m3w5 na versão de Zod abaixo de 4.6.6. A dependência foi atualizada para 4.6.7; a execução seguinte de `bun run security:audit` terminou sem vulnerabilidades.

A verificação cobre dependências do projeto. Não representa análise de imagem Docker, configuração de infraestrutura, segredos ou revisão manual de código.
