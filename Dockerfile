# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Production
FROM node:18-alpine
WORKDIR /app

# Setup non-root user
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/src ./src

RUN chown -R node:node /app
USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["npm", "start"]
