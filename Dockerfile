FROM node:18-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client with correct OpenSSL version specification
ENV PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set environment variables
ENV NODE_ENV=production
ENV PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary

# Expose the API port
EXPOSE 3001

# Create startup script
COPY --from=builder /app/prisma/schema.prisma ./prisma/
RUN echo '#!/bin/sh\n\
echo "Waiting for database to be ready..."\n\
sleep 5\n\
echo "Running database migrations..."\n\
npx prisma migrate deploy\n\
echo "Starting application..."\n\
node dist/src/main.js' > /app/startup.sh \
&& chmod +x /app/startup.sh

# Command to run the application with migrations
CMD ["/app/startup.sh"]
