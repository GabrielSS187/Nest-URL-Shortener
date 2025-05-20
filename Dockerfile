FROM node:22-alpine AS builder
WORKDIR /app

# 1) Copia somente o package.json e o lockfile
COPY package.json package-lock.json ./

# 2) Copia o schema e migrations para dentro do container
COPY prisma ./prisma

# 3) Instala deps e gera o Prisma Client
RUN npm ci \
 && npx prisma generate

# 4) Agora traz todo o resto do código
COPY . .

# 5) Compila e remove dev-deps
RUN npm run build \
 && npm prune --production

FROM node:22-alpine AS prod
WORKDIR /app

# 1) cria o grupo e o usuário 'app'
RUN addgroup -S app \
 && adduser  -S -G app app

# 2) copia tudo que vem do builder
COPY --from=builder /app/package.json       ./package.json
COPY --from=builder /app/package-lock.json  ./package-lock.json
COPY --from=builder /app/node_modules       ./node_modules
COPY --from=builder /app/dist               ./dist
COPY --from=builder /app/prisma             ./prisma

# 3) troca para esse usuário
USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
