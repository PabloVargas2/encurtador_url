const path = require('node:path');
const express = require('express');
const { generateCode, isValidUrl, isValidCode } = require('./shortener');
const { createMemoryStore } = require('./store/memoryStore');

const MAX_ATTEMPTS = 5;

function createApp(options = {}) {
  const store = options.store || createMemoryStore();
  const baseUrl = options.baseUrl || 'http://localhost:3000';
  const codeLength = options.codeLength || 6;

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '10kb' }));
  app.use(express.static(path.join(__dirname, '..', 'public')));

  const toResponse = (link) => ({
    ...link,
    shortUrl: `${baseUrl}/${link.code}`,
  });

  // Verificação de saúde, útil para monitoramento e balanceadores de carga.
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  // Cria um link curto. Corpo: { "url": "https://...", "alias": "opcional" }
  app.post('/api/links', async (req, res, next) => {
    try {
      const { url, alias } = req.body || {};

      if (!isValidUrl(url)) {
        return res.status(400).json({ error: 'Informe uma URL válida começando com http:// ou https://' });
      }

      let code;
      if (alias !== undefined && alias !== '') {
        if (!isValidCode(alias)) {
          return res.status(400).json({
            error: 'Apelido inválido: use de 3 a 32 letras, números, hífen ou sublinhado',
          });
        }
        if (await store.has(alias)) {
          return res.status(409).json({ error: 'Este apelido já está em uso' });
        }
        code = alias;
      } else {
        for (let attempt = 0; attempt < MAX_ATTEMPTS && !code; attempt += 1) {
          const candidate = generateCode(codeLength);
          if (!(await store.has(candidate))) code = candidate;
        }
        if (!code) {
          return res.status(503).json({ error: 'Não foi possível gerar um código, tente novamente' });
        }
      }

      const link = await store.save({
        code,
        url,
        clicks: 0,
        createdAt: new Date().toISOString(),
      });

      return res.status(201).json(toResponse(link));
    } catch (err) {
      return next(err);
    }
  });

  // Consulta os dados de um link (URL original, cliques, data de criação).
  app.get('/api/links/:code', async (req, res, next) => {
    try {
      const link = await store.get(req.params.code);
      if (!link) return res.status(404).json({ error: 'Link não encontrado' });
      return res.json(toResponse(link));
    } catch (err) {
      return next(err);
    }
  });

  // Redireciona o código curto para a URL original.
  app.get('/:code', async (req, res, next) => {
    try {
      const link = await store.incrementClicks(req.params.code);
      if (!link) return res.status(404).json({ error: 'Link não encontrado' });
      return res.redirect(302, link.url);
    } catch (err) {
      return next(err);
    }
  });

  // Tratamento de erros: JSON malformado e falhas inesperadas.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ error: 'JSON inválido no corpo da requisição' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  });

  return app;
}

module.exports = { createApp };
