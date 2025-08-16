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
# 4. Ensure templates directory exists and copy templates explicitly
RUN mkdir -p templates
RUN echo "=== Templates in root ==="
RUN ls -la templates/
# Explicitly copy templates to ensure they're available
COPY templates/* templates/
RUN echo "=== After explicit copy ==="
RUN ls -la templates/
RUN npm run build

### Production stage ###
FROM node:18-slim
WORKDIR /app

# 5. Install OS requirements for Prisma
RUN apt-get update && \
    apt-get install -y \
      openssl \
      python3 \
      make \
      g++ \
      netcat-traditional \
      postgresql-client && \
    rm -rf /var/lib/apt/lists/*

# 6. Install only production deps
COPY package*.json ./
RUN npm install --only=production

# 7. Copy Prisma binaries & client into prod image
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# 8. Copy built app and config
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/startup.sh ./startup.sh
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 9. Copy email templates to the new location
RUN mkdir -p ./dist/templates
# Copy templates from builder stage
COPY --from=builder /app/templates/notification.ejs ./dist/templates/
COPY --from=builder /app/templates/grade-notification.ejs ./dist/templates/
COPY --from=builder /app/templates/schedule-change.ejs ./dist/templates/
COPY --from=builder /app/templates/verification-code.ejs ./dist/templates/
COPY --from=builder /app/templates/README.md ./dist/templates/
COPY --from=builder /app/templates/test-templates.html ./dist/templates/
COPY --from=builder /app/templates/run-test.html ./dist/templates/

# 10. Tell Prisma to use binary engine
ENV PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary
ENV NODE_ENV=production

RUN chmod +x startup.sh
EXPOSE 3001
CMD ["sh", "./startup.sh"]
