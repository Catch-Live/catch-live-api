# --- 빌드 스테이지 ---
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# --- 실행 스테이지 ---
FROM node:18-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV WORKER_ID=worker-1
ENV WORKER_PORT=5001

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

CMD ["node", "dist/src/infrastructure/recording/worker/recording.process-worker.js"]