FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./

FROM base AS deps
RUN --mount=type=cache,target=/root/.npm \
    npm ci --prefer-offline --no-audit --no-fund

FROM deps AS builder
COPY . .
RUN npx prisma generate
RUN npm run build

FROM deps AS prod-deps
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --prefer-offline --no-audit --no-fund && \
    npm rebuild bcrypt --build-from-source

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl && \
    addgroup -S nodejs && adduser -S nestjs -G nodejs
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY package*.json ./
USER nestjs
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/ || exit 1
CMD ["node", "dist/main.js"]