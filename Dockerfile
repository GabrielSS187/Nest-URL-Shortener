FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /app

RUN addgroup -S app && adduser -S -G app app

COPY --from=builder /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

USER app

EXPOSE 3000
CMD ["node", "dist/main.js"]
