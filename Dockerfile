# ---------- deps stage ----------
FROM node:22.20-alpine@sha256:dbcedd8aeab47fbc0f4dd4bffa55b7c3c729a707875968d467aaaea42d6225af AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci --production

# ---------- app stage ----------
FROM node:22.20-alpine@sha256:dbcedd8aeab47fbc0f4dd4bffa55b7c3c729a707875968d467aaaea42d6225af AS app
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Install curl for health checks
RUN apk update && apk add --no-cache curl

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY tests/.htpasswd ./tests/.htpasswd

# Expose port
EXPOSE 8080

# Healthcheck (CORRECT ✓)
HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8080/ || exit 1

CMD ["npm", "start"]
