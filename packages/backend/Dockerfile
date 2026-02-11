FROM node:20-alpine
WORKDIR /app
RUN npm install -g pnpm@9.15.4

# Install production deps
COPY packages/backend/package.json ./
COPY pnpm-lock.yaml ./
RUN pnpm install --prod

# Copy built app
COPY packages/backend/dist ./dist

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001 -G nodejs
USER nestjs

EXPOSE 8080
CMD ["node", "dist/main.js"]
