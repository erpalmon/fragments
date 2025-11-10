# ---------- deps stage: install production deps only ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Install only prod deps; cache-friendly
COPY package*.json ./
RUN npm ci --omit=dev

# ---------- app stage: tiny runtime image ----------
FROM node:20-alpine AS app
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# PID 1 handling for clean shutdowns
RUN apk add --no-cache tini

# Copy production node_modules first, then only runtime files
COPY --from=deps /app/node_modules /app/node_modules
COPY package*.json ./
COPY src ./src

# Security: run as non-root
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 8080

# Basic healthcheck against your health endpoint
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:8080/ || exit 1

# Entrypoint + command (no npm wrapper needed)
ENTRYPOINT ["/sbin/tini","--"]
CMD ["node","src/index.js"]
