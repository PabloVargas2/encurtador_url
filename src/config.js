// Todas as configurações vêm de variáveis de ambiente, com valores padrão
// para desenvolvimento local.
const port = Number(process.env.PORT) || 3000;

const config = {
  port,
  // Endereço público usado para montar os links curtos devolvidos pela API.
  baseUrl: (process.env.BASE_URL || `http://localhost:${port}`).replace(/\/+$/, ''),
  // Quantidade de caracteres dos códigos gerados automaticamente.
  codeLength: Number(process.env.CODE_LENGTH) || 6,
};

module.exports = config;
