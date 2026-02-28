FROM mcr.microsoft.com/playwright:v1.50.1-noble AS builder
WORKDIR /app

# Copy root configs
COPY package.json package-lock.json turbo.json tsconfig.json ./

# Copy source code
COPY apps ./apps
COPY packages ./packages

# Build Optimizations
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm ci --no-audit --no-fund

# Correct Monorepo execution: Use workspace-aware prisma generation
RUN npm run generate --workspace=@unrole/db

# Build the worker and its local dependencies
RUN npx turbo run build --filter=worker...

FROM mcr.microsoft.com/playwright:v1.50.1-noble AS runner
WORKDIR /app

# Copy the full workspace context needed for runtime resolution
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/worker ./apps/worker
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production

CMD ["node", "apps/worker/dist/main"]
