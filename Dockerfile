# ── Build stage ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install root deps (production copy first for layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && cp -R node_modules /prod_node_modules
RUN npm ci

# Install client deps and build
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY . .
RUN cd client && npm run build

# ── Production stage ──────────────────────────────────────────
FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

COPY --from=builder /prod_node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
ENV PORT=8080

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
