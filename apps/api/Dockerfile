FROM node:20-alpine AS builder
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

# Build the API using Turborepo
RUN npx turbo run build --filter=api...

FROM node:20-alpine AS runner
WORKDIR /app

# The fix: Copy EVERYTHING Node needs at runtime to resolve workspace links
# node_modules contains the symlinks, packages contains the actual compiled code
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/package.json ./package.json

ENV PORT=3001
EXPOSE 3001

# Start from the dist folder but ensure we are in the context where node_modules is visible
CMD ["node", "apps/api/dist/main"]
