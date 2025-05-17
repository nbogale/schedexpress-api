### Builder stage ###
FROM node:18 AS builder
WORKDIR /app

# 1. Install all deps
COPY package*.json ./
RUN npm install

# 2. Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# 3. Copy source & build
COPY . .
RUN npm run build

### Production stage ###
FROM node:18-slim
WORKDIR /app

# 4. Install OS requirements for Prisma
RUN apt-get update && \
    apt-get install -y \
      openssl \
      python3 \
      make \
      g++ \
      netcat-traditional \
      postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# 5. Install only production deps
COPY package*.json ./
RUN npm install --only=production

# 6. Copy Prisma binaries & client into prod image
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# 7. Copy built app and config
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/startup.sh ./startup.sh
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 8. Tell Prisma to use binary engine
ENV PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary

RUN chmod +x startup.sh
EXPOSE 3001
CMD ["sh", "./startup.sh"]
