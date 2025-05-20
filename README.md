# 🔗 Nest URL Shortener API

API RESTful construída com **NestJS** para encurtar URLs, registrar acessos e fornecer estatísticas de cliques. Desenvolvida com foco em **Clean Architecture**, segurança, performance e extensibilidade.

---

## 📋 Sumário

- [📦 Tecnologias](#-tecnologias)  
- [🚀 Como executar](#-como-executar)  
  - [🔧 Requisitos](#-requisitos)  
  - [🧱 Modo local](#-modo-local)  
  - [🐳 Com Docker](#-com-docker)  
- [🧪 Testes](#-testes)  
- [🧱 Arquitetura](#-arquitetura)  
- [🔐 Segurança](#-segurança)  
- [📝 Documentação Swagger](#-documentação-swagger)  
- [📦 CI/CD](#-cicd)  
- [📁 Variáveis de ambiente](#-variáveis-de-ambiente)  
- [📄 Mapeamento do banco de dados (ERD simplificado)](#-mapeamento-do-banco-de-dados-erd-simplificado) 
- [🧱 Arquitetura do Projeto](#-arquitetura-do-projeto) 
- [⚙️ Melhorias futuras e escalabilidade](#%EF%B8%8F-melhorias-futuras-e-escalabilidade)
- [🧑‍💻 Autor](#-autor)  

---

## 📦 Tecnologias

- [NestJS](https://nestjs.com/)  
- TypeScript  
- [Prisma](https://www.prisma.io/) + PostgreSQL  
- Swagger (`@nestjs/swagger`)  
- JWT com Passport (`@nestjs/jwt`, `passport-jwt`)  
- Validação de DTOs com `class-validator` + `ValidationPipe`  
- Segurança HTTP com [Helmet](https://helmetjs.github.io/)  
- Limite de requisições com `@nestjs/throttler`  
- Logs estruturados com [nestjs-pino](https://github.com/iamolegga/nestjs-pino)  
- Testes com [Jest](https://jestjs.io/) e [Supertest](https://github.com/visionmedia/supertest)  
- Contêineres com Docker & Docker Compose  
- CI/CD com GitHub Actions  

---

## 🚀 Como executar

### 🔧 Requisitos

- [Node.js](https://nodejs.org/) 20+  
- [npm](https://www.npmjs.com/)  
- [Docker](https://www.docker.com/) (opcional)

### 🧱 Modo local

```bash
# Instale dependências
npm ci

# Rode em modo de desenvolvimento
npm run start:dev
```
- A API estará em: http://localhost:3000/api

- Swagger UI: http://localhost:3000/docs

- 🚨 .env obrigatório

- 🚨 Depois do .env rode as migrações do prisma antes de iniciar o servidor

### 🐳 Com Docker
```bash
# Ambiente de desenvolvimento
docker compose --profile dev up --build

# Ambiente de produção
docker compose --profile prod up --build
```
- A API estará em: http://localhost:3000/api

- Swagger UI: http://localhost:3000/docs

- 🚨 .env não precisa

# 🧪 Testes
```bash
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

Com Docker
```bash
docker compose --profile test run --rm nest-test
```


# 🧱 Arquitetura
Clean Architecture + DDD

Módulos isolados por responsabilidade:

modules/auth – autenticação JWT

modules/user – cadastro e gerenciamento de usuários

modules/url – encurtamento, listagem, atualização e remoção de URLs

modules/access-log – registro de acessos para estatísticas

modules/prisma – configuração e serviço do Prisma ORM

Repositórios (interfaces) + implementações (Prisma / In-Memory)

Controllers → Services → Repositories → Entities

# 🔐 Segurança
JWT para rotas privadas

ValidationPipe + class-validator para validação de DTOs

Rate limiting com @nestjs/throttler

Helmet para cabeçalhos HTTP seguros

Logs estruturados com nestjs-pino

# 📝 Documentação Swagger
Acesse: http://localhost:3000/docs

Todos os endpoints documentados com exemplos de request/response

Autenticação Bearer configurada no Swagger UI

# 📦 CI/CD
Este projeto inclui um workflow de CI com GitHub Actions em .github/workflows/ci.yml:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        ports:
          - 5433:5432
        env:
          POSTGRES_USER: root
          POSTGRES_PASSWORD: root
          POSTGRES_DB: root
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    env:
      DATABASE_URL: postgres://root:root@localhost:5433/root
      JWT_SECRET: test-secret

    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 22

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run Prisma migrations
        run: npx prisma migrate deploy

      - name: Run linter
        run: npm run lint

      - name: Run unit tests
        run: npm run test

      - name: Run e2e tests
        run: npm run test:e2e

  # job de deploy está desabilitado por padrão
  deploy:
    if: false
    needs: build-and-test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy (placeholder)
        run: echo "🚀 Simulando deploy para produção com tag ${{ github.ref }}"
```
gatilhos: push e pull_request na branch main

serviço de teste: PostgreSQL

passos: checkout, Node.js, npm ci, Prisma, lint, testes unitários e E2E

# 📁 Variáveis de ambiente
Exemplo de .env ou .env.example:

```env
# Se for usar o docker compose não precisa desse .env

NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ps_shortener
JWT_SECRET=sua_chave_secreta_aqui
```
- 🚨 Rode as migrações do prisma depois de preencher o ``DATABASE_URL``

# 📄 Mapeamento do banco de dados (ERD simplificado)
```md
## 🧩 Modelagem do Banco de Dados

### 🔐 Tabela `users`

| Campo       | Tipo       | Descrição                     |
|-------------|------------|-------------------------------|
| id          | Int (PK)   | Identificador do usuário      |
| email       | String     | E-mail único                  |
| password    | String     | Hash da senha                 |
| createdAt   | DateTime   | Criado em                     |
| updatedAt   | DateTime   | Atualizado em                 |
| deletedAt   | DateTime?  | Deletado logicamente          |

---

### 🔗 Tabela `short_urls`

| Campo        | Tipo       | Descrição                         |
|--------------|------------|-----------------------------------|
| id           | Int (PK)   | Identificador do encurtamento     |
| shortCode    | String     | Código único de 6 caracteres      |
| destination  | String     | URL original                      |
| userId       | Int? (FK)  | ID do usuário (nullable)          |
| createdAt    | DateTime   | Criado em                         |
| updatedAt    | DateTime   | Atualizado em                     |
| deletedAt    | DateTime?  | Deletado logicamente              |

---

### 📈 Tabela `access_logs`

| Campo     | Tipo       | Descrição                        |
|-----------|------------|----------------------------------|
| id        | Int (PK)   | Identificador do log             |
| urlId     | Int (FK)   | Referência ao short_url          |
| timestamp | DateTime   | Quando o clique ocorreu          |

```

# 🧱 Arquitetura do Projeto
```bash
src/
├── app.module.ts               # Módulo principal
├── main.ts                     # Bootstrap da aplicação
├── modules/
│   ├── auth/                   # Autenticação (login, JWT, Guards)
│   │   ├── dto/                # LoginDto, LoginResponseDto
│   │   ├── entities/           # (nenhuma entidade própria)
│   │   ├── repositories/       # IUserRepository, in-memory & Prisma
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── optional-jwt-auth.guard.ts
│   ├── user/                   # Cadastro e domínio do usuário
│   │   ├── dto/                # CreateUserDto, UserResponseDto
│   │   ├── entities/           # UserEntity
│   │   ├── repositories/       # IUserRepository, in-memory & Prisma
│   │   ├── user.controller.ts
│   │   └── user.service.ts
│   ├── url/                    # Encurtamento, listagem e redirecionamento
│   │   ├── dto/                # CreateUrlDto, ShortenUrlResponseDto, UrlWithClicksDto
│   │   ├── entities/           # UrlEntity
│   │   ├── repositories/       # IUrlRepository, in-memory & Prisma
│   │   ├── url.controller.ts
│   │   ├── url-redirect.controller.ts
│   │   └── url.service.ts
│   ├── access-log/             # Registro e contagem de cliques
│   │   ├── entities/           # AccessLogEntity
│   │   ├── repositories/       # IAccessLogRepository, in-memory & Prisma
│   │   └── access-log.module.ts
│   ├── health/                 # Health check
│   │   ├── health.controller.ts
│   │   └── health.module.ts
│   └── prisma/                 # PrismaService (global)
│       ├── prisma.module.ts
│       └── prisma.service.ts
├── prisma/                     # Schema do banco (Prisma)
│   └── schema.prisma
└── .github/                    # Fluxos de CI/CD
    └── workflows/
        └── ci.yml

```

# ⚙️ Melhorias futuras e escalabilidade
- 🔐 Implementar refresh tokens e expiração de sessão
- 🧠 Cache com Redis para shortCodes mais acessados
- 📊 Dashboard com métricas e relatórios para usuários autenticados
- ✈️ Deploy com Fly.io, Render ou Vercel Functions (monorepo adaptável)


# 🧑‍💻 Autor
Este projeto foi desenvolvido por Seu Nome.
https://www.linkedin.com/in/gabriel-silva-souza-developer/
