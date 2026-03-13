FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package*.json ./apps/api/
COPY packages/shared/package*.json ./packages/shared/

RUN npm install

COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

RUN npm run build --workspace=@ortak-kasa/shared 2>/dev/null || true
RUN npm run build --workspace=api

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3001

CMD ["node", "dist/main"]
