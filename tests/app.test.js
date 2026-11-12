const request = require('supertest');
const { createApp } = require('../src/app');

const BASE_URL = 'https://enc.test';
let app;

beforeEach(() => {
  // Cada teste recebe uma aplicação nova, com armazenamento vazio.
  app = createApp({ baseUrl: BASE_URL });
});

describe('GET /health', () => {
  test('responde com status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('POST /api/links', () => {
  test('cria link com código gerado', async () => {
    const res = await request(app).post('/api/links').send({ url: 'https://exemplo.com' });

    expect(res.status).toBe(201);
    expect(res.body.url).toBe('https://exemplo.com');
    expect(res.body.code).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(res.body.shortUrl).toBe(`${BASE_URL}/${res.body.code}`);
    expect(res.body.clicks).toBe(0);
  });

  test('cria link com apelido escolhido', async () => {
    const res = await request(app)
      .post('/api/links')
      .send({ url: 'https://exemplo.com', alias: 'meu-link' });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe('meu-link');
  });

  test('recusa apelido já existente', async () => {
    await request(app).post('/api/links').send({ url: 'https://a.com', alias: 'repetido' });
    const res = await request(app).post('/api/links').send({ url: 'https://b.com', alias: 'repetido' });

    expect(res.status).toBe(409);
  });

  test('recusa apelido inválido', async () => {
    const res = await request(app).post('/api/links').send({ url: 'https://a.com', alias: 'a b' });
    expect(res.status).toBe(400);
  });

  test('recusa URL inválida', async () => {
    const res = await request(app).post('/api/links').send({ url: 'isso-nao-e-url' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('recusa corpo vazio', async () => {
    const res = await request(app).post('/api/links').send({});
    expect(res.status).toBe(400);
  });

  test('recusa JSON malformado', async () => {
    const res = await request(app)
      .post('/api/links')
      .set('Content-Type', 'application/json')
      .send('{"url": ');
    expect(res.status).toBe(400);
  });
});

describe('GET /:code', () => {
  test('redireciona para a URL original', async () => {
    const created = await request(app).post('/api/links').send({ url: 'https://exemplo.com/destino' });
    const res = await request(app).get(`/${created.body.code}`);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('https://exemplo.com/destino');
  });

  test('retorna 404 para código inexistente', async () => {
    const res = await request(app).get('/naoexiste');
    expect(res.status).toBe(404);
  });
});

describe('GET /api/links/:code', () => {
  test('conta os cliques de cada redirecionamento', async () => {
    const created = await request(app).post('/api/links').send({ url: 'https://exemplo.com' });
    const { code } = created.body;

    await request(app).get(`/${code}`);
    await request(app).get(`/${code}`);
    const res = await request(app).get(`/api/links/${code}`);

    expect(res.status).toBe(200);
    expect(res.body.clicks).toBe(2);
  });

  test('retorna 404 para código inexistente', async () => {
    const res = await request(app).get('/api/links/naoexiste');
    expect(res.status).toBe(404);
  });
});

describe('GET /', () => {
  test('serve a página inicial', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Encurtador de URLs');
  });
});
