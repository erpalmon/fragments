# ---------- deps stage ----------
FROM node:22.10-alpine AS deps
WORKDIR /app

COPY package*.json ./
# In your Dockerfile, update the apk add line:
RUN apk add --no-cache curl=8.5.0-r0 bash=5.2.21-r0

# ---------- app stage ----------
FROM node:22.10-alpine AS app
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_COLOR=false

# Install required tools (unpinned versions)
RUN apk add --no-cache curl=8.5.0-r0 jq=1.7.1-r0

COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY src ./src
COPY tests/.htpasswd ./tests/.htpasswd

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=30s --start-period=10s --retries=3 \
  CMD curl --fail http://localhost:8080/ || exit 1

CMD ["npm", "start"]
