import { createProductionApp } from './presentation/production-app';

const port = Number(process.env.PORT ?? 3000);
const app = createProductionApp();
app.listen(port);
console.log(`Oficina API disponível em http://localhost:${port}/openapi`);
