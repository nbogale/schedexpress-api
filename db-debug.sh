#!/bin/sh

# This script helps debug database connection issues on Railway

# Print environment variables (sensitive info masked)
echo "Environment variables check:"
echo "DATABASE_URL exists: $(if [ -n "$DATABASE_URL" ]; then echo "YES"; else echo "NO"; fi)"
echo "DATABASE_URL starts with: $(echo $DATABASE_URL | cut -c 1-15)..."

echo "PGHOST exists: $(if [ -n "$PGHOST" ]; then echo "YES"; else echo "NO"; fi)"
echo "PGPORT exists: $(if [ -n "$PGPORT" ]; then echo "YES"; else echo "NO"; fi)"
echo "PGUSER exists: $(if [ -n "$PGUSER" ]; then echo "YES"; else echo "NO"; fi)"
echo "PGPASSWORD exists: $(if [ -n "$PGPASSWORD" ]; then echo "YES (value hidden)"; else echo "NO"; fi)"
echo "PGDATABASE exists: $(if [ -n "$PGDATABASE" ]; then echo "YES"; else echo "NO"; fi)"

# Try to parse DATABASE_URL if it exists
if [ -n "$DATABASE_URL" ]; then
  echo "\nParsing DATABASE_URL:"
  # Extract host:port
  HOSTPORT=$(echo $DATABASE_URL | sed -e 's/^.*@//' -e 's/\/.*//')
  
  # Split host and port
  PARSED_HOST=$(echo $HOSTPORT | sed -e 's/:.*//')
  PARSED_PORT=$(echo $HOSTPORT | sed -e 's/.*://')
  
  # Extract username
  PARSED_USER=$(echo $DATABASE_URL | sed -e 's/^.*:\/\///' -e 's/:.*$//')
  
  # Extract database name
  PARSED_DB=$(echo $DATABASE_URL | sed -e 's/^.*\///')
  
  echo "Parsed HOST: $PARSED_HOST"
  echo "Parsed PORT: $PARSED_PORT"
  echo "Parsed USER: $PARSED_USER"
  echo "Parsed DB: $PARSED_DB"
fi

# Try to connect to the database
echo "\nTrying to connect to database with pg_isready:"
if [ -n "$PGHOST" ] && [ -n "$PGPORT" ]; then
  pg_isready --host="$PGHOST" --port="$PGPORT" --username="$PGUSER" --dbname="$PGDATABASE"
  echo "pg_isready exit code: $?"
elif [ -n "$DATABASE_URL" ]; then
  # Try with parsed values
  pg_isready --host="$PARSED_HOST" --port="$PARSED_PORT" --username="$PARSED_USER" --dbname="$PARSED_DB"
  echo "pg_isready (with parsed DATABASE_URL) exit code: $?"
else
  echo "Cannot test connection: No database connection details available"
fi

# Show listening ports
echo "\nListening ports on the system:"
netstat -tuln || ss -tuln || echo "Network tools not available"

# Check if PostgreSQL is running on localhost
echo "\nChecking if PostgreSQL is running on localhost:"
pg_isready --host="localhost" --port="5432" || echo "PostgreSQL is not running on localhost:5432"

# Print Prisma connection info (without sensitive details)
echo "\nPrisma debug info:"
npx prisma --version
echo "DATABASE_URL in prisma/.env (masked): $(if [ -f prisma/.env ]; then grep DATABASE_URL prisma/.env | sed 's/\(DATABASE_URL=.*:\/\/\)[^@]*\(@.*\)/\1*****\2/'; else echo "File not found"; fi)"

echo "\nDebug info collection complete. Please provide this information for troubleshooting."