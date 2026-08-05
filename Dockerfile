# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# Сборка сайта Нукусского филиала УзГИИК.
# Три стадии: зависимости → сборка → минимальный образ для запуска.
# Итоговый образ не содержит ни исходников, ни dev-зависимостей.
# ─────────────────────────────────────────────────────────────

FROM node:22-alpine AS deps
WORKDIR /app
# libc6-compat нужен sharp и нативным зависимостям Payload на Alpine
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci


FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# На сборке база не нужна: страницы пререндерятся на резервном контенте,
# а реальные данные подтягиваются при первом запросе через ISR.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build


FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat && \
    addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Standalone-сборка тянет за собой только реально импортированные модули
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Каталоги, куда пишет медиатека: монтируются томом, права — за пользователем nextjs
RUN mkdir -p public/media/uploads public/documents && \
    chown -R nextjs:nodejs public/media public/documents

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/qq').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
