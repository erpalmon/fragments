# ---------- Build stage (dev deps allowed for build) ----------
FROM node:18.13.0 AS build
WORKDIR /app

# Better layer caching: copy only package files first
COPY package*.json ./
RUN npm ci --omit=dev=false

# Copy source and any runtime assets you need (like .htpasswd)
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd
# If you transpile/bundle, do it here:
# RUN npm run build

# ---------- Runtime stage (smaller, prod-only, non-root) ----------
FROM node:18.13.0-slim AS runtime
ENV NODE_ENV=production
ENV PORT=8080
WORKDIR /app

# Install prod deps only (smaller image)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy the built app (or source) from the build stage
COPY --from=build /app/src ./src
COPY --from=build /app/tests/.htpasswd ./tests/.htpasswd

# Security: run as non-root
RUN useradd -m appuser
USER appuser

EXPOSE 8080
CMD ["npm", "start"]
