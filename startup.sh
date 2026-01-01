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
# For Cloud SQL Unix socket connections, skip pg_isready check
if echo "$DATABASE_URL" | grep -q "/cloudsql/"; then
  echo "Cloud SQL Unix socket connection detected, skipping pg_isready check"
  echo "Database connection will be validated by Prisma"
else
echo "Waiting for database at $PGHOST:$PGPORT…"
  until pg_isready --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" --dbname="$PGDATABASE" 2>/dev/null; do
  echo "  › Database not ready, retrying in 2s…"
  sleep 2
done
echo "✅ Database is ready!"
fi

# Generate Prisma client
echo "Generating Prisma client…"
npx prisma generate

# Run migrations
echo "Running Prisma migrations…"
npx prisma migrate deploy

# Seed if needed (skip in production)
if [ "$NODE_ENV" != "production" ] && [ -f "prisma/seed.ts" ]; then
  echo "Seeding database…"
  npx prisma db seed
else
  echo "Skipping database seeding in production environment"
fi

# Start the application - always try to run main.js regardless of NODE_ENV
echo "Starting the application..."

# Try the standard location first
if [ -f "dist/main.js" ]; then
  echo "Starting application from dist/main.js"
  node dist/main.js
# Then try to find main.js anywhere
else
  echo "dist/main.js not found. Searching for main.js..."
  MAIN_JS=$(find . -name "main.js" | grep -v "node_modules" | head -n 1)
  
  if [ -n "$MAIN_JS" ]; then
    echo "Found main.js at $MAIN_JS. Starting the application..."
    node "$MAIN_JS"
  else
    echo "ERROR: Could not find main.js file!"
    echo "Listing all JS files in the project:"
    find . -type f -name "*.js" | grep -v "node_modules" | sort
    
    echo "Trying the most likely location as a last resort..."
    # As a last resort, check if dist/ contains any JavaScript files
    DIST_FILES=$(find ./dist -type f -name "*.js" 2>/dev/null | head -n 1)
    if [ -n "$DIST_FILES" ]; then
      echo "Found JavaScript file in dist/: $DIST_FILES. Attempting to run..."
      node "$DIST_FILES"
    else
      echo "FATAL ERROR: No JavaScript files found to run in dist/"
      exit 1
    fi
  fi
fi
echo "Application started successfully!"
