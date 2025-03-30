# SchedExpress API Docker Setup

This document provides instructions for running the SchedExpress API using Docker.

## 🚀 Quick Start

### Development Mode (with Hot Reload)

For local development with hot reload:

```bash
# Build and start the containers
npm run docker:dev:build
npm run docker:dev:up

# Or use Docker Compose directly
docker-compose -f docker-compose.dev.yml up
```

This will:
- Start a PostgreSQL database container
- Start a NestJS API container with hot reload (code changes will trigger automatic restart)
- Mount your local source code into the container

### Production Mode

For production-like environment:

```bash
# Build and start the containers
npm run docker:build
npm run docker:up

# Or use Docker Compose directly
docker-compose up
```

This will:
- Start a PostgreSQL database container
- Start a NestJS API container with optimized build

## 📝 Environment Variables

The Docker Compose files include default environment variables for development. For production, you should modify these values in the docker-compose.yml file or use environment-specific files.

## 🛠️ Troubleshooting

### Error: Cannot find module '/app/dist/main'

If you encounter this error, it means the build process is not correctly generating the output files. Try these steps:

1. Rebuild the containers:
   ```bash
   docker-compose down
   docker-compose build --no-cache
   docker-compose up
   ```

2. Check that the Dockerfile is correctly set up to:
   - Build the NestJS application
   - Copy the built files to the correct location
   - Set the correct entry point (should be 'dist/main.js')

### Database Connection Issues

If the API cannot connect to the database:

1. Ensure the database container is running and healthy:
   ```bash
   docker-compose ps
   ```

2. Check the database URL environment variable:
   ```bash
   # Database URL format
   postgresql://postgres:password@db:5432/schedexpress
   ```

3. Try waiting longer for the database to initialize (it can take a moment on the first run).

## 🧪 Manually Testing the API

Once the containers are running, you can test the API:

```bash
# Check if the API is running
curl http://localhost:3001/api/settings

# Try to login with a seeded user
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@schedexpress.com","password":"Welcome2ES!"}'
```

## 🧹 Cleaning Up

To stop and remove the containers:

```bash
# Development environment
npm run docker:dev:down

# Production environment
npm run docker:down
```

To remove all data including volumes:

```bash
docker-compose down -v
```
