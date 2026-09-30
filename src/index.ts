import { app } from './presentation/app';

const port = Number(process.env.PORT ?? 3000);
app.listen(port);
console.log(`Oficina API disponível em http://localhost:${port}/openapi`);
