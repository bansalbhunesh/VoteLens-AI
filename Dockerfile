# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install root dependencies
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /prod_node_modules
RUN npm ci

# Install client dependencies and build
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY . .
RUN cd client && npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001
COPY --from=builder /prod_node_modules ./node_modules
COPY --from=builder /app/server.js ./
COPY --from=builder /app/api ./api
COPY --from=builder /app/client/dist ./client/dist

ENV NODE_ENV=production
USER appuser
EXPOSE 8080

CMD ["node", "server.js"]
