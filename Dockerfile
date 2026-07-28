# syntax=docker/dockerfile:1

# ---- build the client ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY index.html vite.config.js ./
COPY src/ ./src/
COPY static/ ./static/
RUN npm run build

# ---- production dependencies only ----
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ---- runtime ----
FROM node:22-alpine AS runtime
ENV NODE_ENV=production \
    PORT=3003 \
    HOST=0.0.0.0

WORKDIR /app

# Copied in, never installed here: no build toolchain ends up in the final image.
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY package.json ./
COPY server/ ./server/

# The node image ships an unprivileged `node` user (uid 1000). Nothing here is
# written at runtime, so read-only ownership by root is fine and intentional.
USER node

EXPOSE 3003

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server"]
