# Dockerfile cho NestJS API
# Multi-stage build để giảm kích thước image

# Stage 1: Build
FROM node:20-alpine AS builder

# Cài đặt pnpm đúng phiên bản với project
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy tất cả package.json của workspace để pnpm resolve đúng lockfile
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY apps/web/package.json ./apps/web/
COPY apps/web-v2/package.json ./apps/web-v2/
COPY packages/shared/package.json ./packages/shared/

# Tắt husky trong Docker (husky là devDependency, không cần trong container)
ENV HUSKY=0

# Cài đặt dependencies - chỉ cho api workspace
RUN pnpm install --frozen-lockfile --filter api...

# Copy source code của api
COPY apps/api ./apps/api
COPY packages/shared ./packages/shared

# Build
WORKDIR /app/apps/api
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS production

# Cài đặt pnpm đúng phiên bản
RUN corepack enable && corepack prepare pnpm@8.15.0 --activate

WORKDIR /app

# Copy tất cả package.json của workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY apps/mobile/package.json ./apps/mobile/
COPY apps/web/package.json ./apps/web/
COPY apps/web-v2/package.json ./apps/web-v2/
COPY packages/shared/package.json ./packages/shared/

# Tắt husky trong Docker
ENV HUSKY=0

# Cài đặt production dependencies
RUN pnpm install --frozen-lockfile --prod --filter api...

# Copy built files
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Thiết lập environment
ENV NODE_ENV=production
ENV PORT=3001

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Khởi chạy
WORKDIR /app/apps/api
CMD ["node", "dist/main.js"]
