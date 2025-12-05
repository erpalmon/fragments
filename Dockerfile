# Stage 01: install dependencies (Node >=18.20 to support pino tracingChannel)
FROM node:18.20.8-alpine3.20 AS dependencies

# Define node env to install prod dependencies only and disable Husky scripts during build
ENV NODE_ENV=production
ENV HUSKY=0

# Define work directory for our app
WORKDIR /fragments

# Copy package files
COPY package.json package-lock.json ./

# Configure npm
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Install dependencies without running lifecycle scripts (husky)
RUN npm ci --ignore-scripts

# Stage 02: setup our app
FROM node:18.20.8-alpine3.20 AS setup

WORKDIR /fragments

# Copy the generated node_modules from the dependencies stage
COPY --from=dependencies /fragments/node_modules ./node_modules

# Copy source code and configuration
COPY src ./src
COPY tests/.htpasswd ./tests/.htpasswd
COPY package*.json ./

# Stage 03: run our app
FROM node:18.20.8-alpine3.20

# Set image metadata
LABEL maintainer="Your Name <your.email@example.com>"
LABEL description="Fragments node.js microservice"

WORKDIR /fragments

# Copy everything from the setup stage
COPY --from=setup /fragments ./

# Install curl for healthcheck
# hadolint ignore=DL3018
RUN apk --no-cache --update add curl

# Environment variables
ENV PORT=8080
ENV NODE_ENV=production

# Expose port
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080 || exit 1

# Command to run the application
CMD ["node", "src/index.js"]
