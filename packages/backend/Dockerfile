FROM node:20-alpine
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.4

# Copy workspace files for dependency resolution
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies (ignore scripts to skip husky prepare hook)
RUN pnpm install --prod --filter @smart-customer-service/backend --frozen-lockfile --ignore-scripts

# Copy built application
COPY packages/backend/dist ./packages/backend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

EXPOSE 8080
WORKDIR /app/packages/backend
CMD ["node", "dist/main.js"]
