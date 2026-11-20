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

## Scripts

`npm start` -> Inicia o servidor;
`npm run dev` -> Inicia o servidor reiniciando a cada alteração;
`npm test` -> Roda os testes automatizados (Jest + Supertest);
`npm run lint` -> Verifica o código com o ESLint.

## Configuração

A aplicação lê as configurações de variáveis de ambiente. Os valores padrão servem para rodar localmente. Veja `.env.example`.

## CI/CD e infraestrutura (AWS)

O pipeline fica em `.github/workflows/deploy.yml` e roda no GitHub Actions:

1. **build**: instala as dependências, roda os testes e o lint (em todo push e pull request na `main`).
2. **infra**: cria ou atualiza uma instância EC2 com o CloudFormation, usando o template `IaC/ec2.yml`, e pega o IP público dela (só em push na `main`).
3. **deploy**: acessa a instância por SSH, baixa o código e inicia a aplicação com o pm2.

No primeiro push o stack `encurtador-url` é criado, com Security Group, instância EC2 e Elastic IP. Nos pushes seguintes a instância é reaproveitada e só o código é atualizado.

A região usada é `us-east-2`. Para usar outra, altere `aws-region` no workflow.

**AWS Academy:** as credenciais ficam em AWS Details → AWS CLI e expiram a cada sessão do lab. Atualize os três secrets da AWS antes de rodar o pipeline. A chave `.pem` é baixada no mesmo painel. Verifique se a região permitida no seu lab é a mesma configurada no workflow.

Depois do deploy, a aplicação fica disponível em `http://<IP-da-instância>:3000`. O IP aparece na aba Outputs do stack `encurtador-url` no console do CloudFormation.

## Armazenamento

Os links ficam em memória e se perdem quando o servidor reinicia.
