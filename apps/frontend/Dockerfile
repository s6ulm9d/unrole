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

# Build frontent with environment args
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npx turbo run build --filter=frontend...

FROM node:20-alpine AS runner
WORKDIR /app

# The fix: Copy only built artifacts and package.json to the runner stage
# This ensures that 'next start' finds everything it needs in the expected paths
COPY --from=builder /app/apps/frontend/.next ./apps/frontend/.next
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder /app/apps/frontend/package.json ./apps/frontend/package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:3001
EXPOSE 3000

# Execute next start from the workspace aware path
CMD ["./node_modules/.bin/next", "start", "apps/frontend"]
