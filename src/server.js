const config = require('./config');
const { createApp } = require('./app');

const app = createApp({ baseUrl: config.baseUrl, codeLength: config.codeLength });

const server = app.listen(config.port, () => {
  console.log(`Encurtador rodando em ${config.baseUrl} (porta ${config.port})`);
});

// Encerramento limpo quando o processo recebe sinal de parada
// (por exemplo, ao parar um contêiner ou reiniciar o serviço).
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`Recebido ${signal}, encerrando...`);
    server.close(() => process.exit(0));
  });
}
