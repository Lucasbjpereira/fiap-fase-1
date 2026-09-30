FROM oven/bun:1.3.8-alpine AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
EXPOSE 3000
CMD ["sh", "-c", "bun run db:migrate && bun run db:seed && bun run start"]
