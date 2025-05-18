# Stage 1: build
FROM node:22-alpine AS builder

# Diretório de trabalho
WORKDIR /usr/src/app

# Copia package.json e package-lock.json e instala dependências (incluindo dev)
COPY package*.json ./
RUN npm install

# Copia o restante do código e gera build em JavaScript
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:22-alpine AS runner

WORKDIR /usr/src/app

# Apenas as dependências de produção
ENV NODE_ENV=production

# Copia arquivos compilados e módulos instalados
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Porta padrão da aplicação
EXPOSE 3000

# Comando de inicialização
CMD ["node", "dist/main.js"]
