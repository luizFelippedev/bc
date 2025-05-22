# Portfolio Enterprise Backend

Sistema backend empresarial avançado para portfólio profissional.

## Funcionalidades

- � Autenticação JWT com refresh tokens
- � Analytics em tempo real
- � WebSocket para comunicação em tempo real
- � Sistema de email com templates
- � Upload de arquivos com processamento de imagem
- � Sistema de busca avançado
- �️ Segurança empresarial
- � Monitoramento de performance
- � Sistema de backup automático
- � Testes automatizados

## Requisitos

- Node.js 18+
- Docker & Docker Compose
- MongoDB
- Redis

## Instalação

1. Clone o repositório
2. Copie `.env.example` para `.env`
3. Configure as variáveis de ambiente
4. Execute: `npm install`

## Desenvolvimento

```bash
# Desenvolvimento local
npm run dev

# Com Docker
npm run docker:dev
```

## Produção

```bash
# Deploy com Docker
npm run deploy

# Ou manualmente
npm run build
npm start
```

## Testes

```bash
# Todos os testes
npm test

# Testes de integração
npm run test:integration

# Coverage
npm run test:coverage
```

## Estrutura do Projeto

```
src/
├── controllers/     # Controladores da API
├── services/        # Serviços de negócio
├── models/          # Modelos de dados
├── middlewares/     # Middlewares customizados
├── routes/          # Definições de rotas
├── utils/           # Utilitários
├── types/           # Tipos TypeScript
└── config/          # Configurações
```

## API Documentation

Acesse `/docs` para ver a documentação da API.

## Health Check

Acesse `/health` para verificar o status do sistema.
