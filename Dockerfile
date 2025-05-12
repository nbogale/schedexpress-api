FROM node:18 AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies and rebuild bcrypt
RUN npm install
RUN npm rebuild bcrypt --build-from-source

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-slim

# Install build dependencies and postgresql-client
RUN apt-get update && \
    apt-get install -y \
    python3 \
    make \
    g++ \
    netcat-traditional \
    postgresql-client && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies, rebuild bcrypt, and install necessary tools
RUN npm install --only=production && \
    npm rebuild bcrypt --build-from-source && \
    npm install -g @nestjs/cli && \
    npm install -g ts-node typescript @types/node

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/startup.sh ./startup.sh
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Set environment variable to use binary provider for Prisma
ENV PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary

# Make startup script executable
RUN chmod +x startup.sh

# Expose the API port
EXPOSE 3001

# Run the startup script using sh
CMD ["sh", "./startup.sh"]
