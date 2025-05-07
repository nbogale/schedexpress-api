#!/bin/bash

echo "Waiting for database to be available..."
sleep 10  # Give PostgreSQL time to initialize

# Run Prisma migrations
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Optional: Run seed script if needed
echo "Running database seed..."
npx prisma db seed
