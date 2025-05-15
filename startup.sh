#!/bin/sh

# Function to check if database is ready
check_db() {
  echo "Checking database connection..."
  pg_isready -h db -U postgres -d schedexpress
  return $?
}

# Wait for database to be ready
echo "Waiting for database to be ready..."
until check_db; do
  echo "Database is not ready yet. Waiting..."
  sleep 2
done
echo "Database is ready!"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run seed if needed
echo "Checking if seeding is needed..."
if [ -f "prisma/seed.ts" ]; then
  echo "Running database seed..."
  npx prisma db seed-data-sql
else
  echo "No seed file found, skipping seeding."
fi

# Start the application
echo "Starting the application..."
if [ "$NODE_ENV" = "production" ]; then
  node dist/main.js
else
  npm run start:dev
fi 