#!/bin/sh
# Script to initialize Prisma with the correct environment settings

# Set environment variables for Prisma
export PRISMA_QUERY_ENGINE_LIBRARY_PROVIDER=binary

echo "📦 Setting up Prisma with binary provider..."

# Generate Prisma client
echo "🔄 Generating Prisma client..."
npx prisma generate

# Check if migrations are needed
echo "🔍 Checking database state..."
if npx prisma migrate dev --dry-run | grep -q "No migration needed"; then
    echo "✅ Database is up to date."
else
    echo "🔄 Running migrations..."
    npx prisma migrate dev --name init
fi

# Seed the database if requested
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✨ Prisma setup complete!"
