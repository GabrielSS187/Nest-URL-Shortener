FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci \
 && npx prisma generate

COPY . .
RUN npm run build

RUN npm prune --production

FROM node:22-alpine AS prod
WORKDIR /app

RUN addgroup -S app && adduser -S -G app app

COPY --from=builder /app/package.json        ./package.json
COPY --from=builder /app/package-lock.json   ./package-lock.json
COPY --from=builder /app/node_modules        ./node_modules
COPY --from=builder /app/dist                ./dist

USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main.js"]
