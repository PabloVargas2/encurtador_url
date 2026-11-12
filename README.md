# Encurtador de URLs

Aplicação simples em Node.js e Express que transforma endereços longos em links curtos, redireciona quem acessa o link curto e conta os cliques.

## Requisitos

- Node.js 20 ou superior
- npm

## Como rodar

```bash
npm install
npm start
```

Acesse http://localhost:3000 para usar a página web.

Para desenvolvimento, `npm run dev` reinicia o servidor automaticamente a cada alteração.

## Scripts

| Comando | O que faz |
|---|---|
| `npm start` | Inicia o servidor |
| `npm run dev` | Inicia o servidor reiniciando a cada alteração |
| `npm test` | Roda os testes automatizados (Jest + Supertest) |
| `npm run test:coverage` | Roda os testes e gera relatório de cobertura em `coverage/` |
| `npm run lint` | Verifica o código com o ESLint |

## Configuração

A aplicação lê as configurações de variáveis de ambiente. Os valores padrão servem para rodar localmente. Veja `.env.example`.

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta em que o servidor escuta |
| `BASE_URL` | `http://localhost:PORT` | Endereço público usado para montar os links curtos |
| `CODE_LENGTH` | `6` | Tamanho dos códigos gerados automaticamente |

Exemplo: `PORT=8080 BASE_URL=https://meu-dominio.com npm start`

## API

### `POST /api/links`
Cria um link curto. O campo `alias` é opcional.

```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com", "alias": "github"}'
```

Resposta `201`:
```json
{
  "code": "github",
  "url": "https://github.com",
  "clicks": 0,
  "createdAt": "2026-10-24T22:52:54.916Z",
  "shortUrl": "http://localhost:3000/github"
}
```

Erros: `400` (URL ou apelido inválido), `409` (apelido já em uso).

### `GET /:code`
Redireciona (`302`) para a URL original e soma um clique. Retorna `404` se o código não existir.

### `GET /api/links/:code`
Retorna os dados do link, incluindo o número de cliques.

### `GET /health`
Verificação de saúde. Responde `{"status": "ok", "uptime": <segundos>}`.

## Estrutura

```
src/
  app.js               rotas e regras da aplicação
  server.js            inicializa o servidor HTTP
  config.js            leitura das variáveis de ambiente
  shortener.js         geração e validação de códigos e URLs
  store/memoryStore.js armazenamento em memória
public/
  index.html           página web
tests/                 testes automatizados
```

## Armazenamento

Os links ficam em memória e se perdem quando o servidor reinicia. Para persistir os dados, crie outro módulo em `src/store/` com os mesmos métodos assíncronos (`get`, `has`, `save`, `incrementClicks`) usando um banco de dados e passe-o para `createApp({ store })`. O restante do código não precisa mudar.
