#!/bin/sh

# Load Rails-style PG vars (already set by Railway)
echo "Waiting for database at $PGHOST:$PGPORT…"
until pg_isready --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" --dbname="$PGDATABASE"; do
  echo "  › Database not ready, retrying in 2s…"
  sleep 2
done
echo "✅ Database is ready!"

# Generate Prisma client
echo "Generating Prisma client…"
npx prisma generate

# Run migrations
echo "Running Prisma migrations…"
npx prisma migrate deploy

# Seed if needed
if [ -f "prisma/seed.ts" ]; then
  echo "Seeding database…"
  npx prisma db seed-data-sql
fi

# Start the app
echo "Starting application…"
if [ "$NODE_ENV" = "production" ]; then
  node dist/main.js
else
  npm run start:dev
fi
