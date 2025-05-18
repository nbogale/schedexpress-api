#!/bin/sh

# If DATABASE_URL is set but PGHOST/PGPORT are not, parse DATABASE_URL to set them
if [ -n "$DATABASE_URL" ] && [ -z "$PGHOST" ]; then
  # Parse DATABASE_URL to get connection details
  # Format is typically: postgresql://username:password@hostname:port/database
  
  # Extract host:port
  HOSTPORT=$(echo $DATABASE_URL | sed -e 's/^.*@//' -e 's/\/.*//')
  
  # Split host and port
  export PGHOST=$(echo $HOSTPORT | sed -e 's/:.*//')
  export PGPORT=$(echo $HOSTPORT | sed -e 's/.*://')
  
  # Extract username
  export PGUSER=$(echo $DATABASE_URL | sed -e 's/^.*:\/\///' -e 's/:.*$//')
  
  # Extract password (if present)
  USERPASS=$(echo $DATABASE_URL | sed -e 's/^.*:\/\///' -e 's/@.*$//')
  if echo $USERPASS | grep -q ':'; then
    export PGPASSWORD=$(echo $USERPASS | sed -e 's/^.*://')
  fi
  
  # Extract database name
  export PGDATABASE=$(echo $DATABASE_URL | sed -e 's/^.*\///')
  
  echo "Parsed DATABASE_URL into PGHOST=$PGHOST, PGPORT=$PGPORT, PGUSER=$PGUSER, PGDATABASE=$PGDATABASE"
fi

# Wait for database to be ready
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
  npx prisma db seed
fi

# Start the app
echo "Starting application…"
if [ "$NODE_ENV" = "production" ]; then
  node dist/main.js
else
  npm run start:dev
fi