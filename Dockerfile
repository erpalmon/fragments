# ---------- deps stage: install production deps only ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# ---------- app stage: production runtime ----------
FROM node:20-alpine AS app
WORKDIR /app

# Environment configuration
ENV NODE_ENV=production
ENV PORT=80     
# Install tini for proper signal handling
RUN apk add --no-cache tini

# Copy production node_modules first for caching
COPY --from=deps /app/node_modules /app/node_modules

# Copy application code
COPY package*.json ./
COPY src ./src

# IMPORTANT: run as root (Fargate needs this for port 80)
# DO NOT switch to a non-root user

# App listens on port 80
EXPOSE 80

# ECS-compatible healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:80/v1/health || exit 1

# Use tini as entrypoint
ENTRYPOINT ["/sbin/tini","--"]

# Start the fragments server
CMD ["node","src/index.js"]
