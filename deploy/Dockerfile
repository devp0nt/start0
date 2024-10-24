# ============ Prebase stage
FROM node:22.1.0 AS prebase

RUN npm install -g pnpm

WORKDIR /app

# Copy dependency files
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY packages/webapp/package.json packages/webapp/package.json
COPY packages/backend/package.json packages/backend/package.json
COPY packages/general/package.json packages/general/package.json

# Fetch dependencies
RUN pnpm fetch

# Copy all source code
COPY . .

# Install dependencies offline
RUN pnpm install --offline --ignore-scripts --frozen-lockfile

# Build the app
ARG NODE_ENV=production
ARG SENTRY_AUTH_TOKEN
ARG SOURCE_VERSION

RUN pnpm b prepare
RUN pnpm b build
RUN pnpm b sentry
RUN pnpm w build

# ============ Base stage
FROM node:22.1.0-alpine AS base

COPY --from=prebase /app /app

WORKDIR /app

# Install production dependencies
RUN npm install -g pnpm
RUN pnpm install --ignore-scripts --frozen-lockfile --prod

RUN pnpm b pgc

ARG SOURCE_VERSION
ENV SOURCE_VERSION=$SOURCE_VERSION

# ============ Stage for worker-migrator
FROM base AS worker-migrator
CMD ["pnpm", "b", "pmp"]

# ============ Stage for worker-general
FROM base AS worker-general
CMD ["pnpm", "b", "start-worker-general"]

# ============ Stage for worker-special
FROM base AS worker-special
CMD ["pnpm", "b", "start-worker-special"]

# ============ Stage for web app
FROM base AS app
CMD ["pnpm", "b", "start-app"]
