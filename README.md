# SchedExpress API

NestJS backend API for the SchedExpress scheduling system.

## Overview

This API serves as the backend for the SchedExpress application, providing all the necessary endpoints for managing course schedules, handling schedule change requests, and facilitating communication between students, counselors, and administrators.

## Technology Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with Passport.js
- **API Documentation**: Swagger

## Features

- User authentication and role-based authorization
- Course management
- Student schedule creation and management
- Schedule change request workflow
- Conflict detection and resolution
- Notification system
- System settings and configuration

## Project Structure

The project follows the NestJS modular architecture:

```
schedexpress-api/
├── src/
│   ├── auth/                   # Authentication and authorization
│   ├── users/                  # User management
│   ├── courses/                # Course management
│   ├── schedules/              # Schedule management
│   ├── schedule-change-requests/ # Change request workflow
│   ├── conflicts/              # Conflict detection and handling
│   ├── notifications/          # Notification system
│   ├── settings/               # System settings
│   ├── prisma/                 # Prisma service and module
│   ├── app.module.ts           # Main application module
│   └── main.ts                 # Application entry point
├── prisma/                    # Prisma schema and migrations
│   └── schema.prisma           # Database schema
└── test/                      # Test files
```

## API Endpoints

The API provides endpoints for:

- Authentication (`/api/auth`)
- User management (`/api/users`)
- Course management (`/api/courses`)
- Schedule management (`/api/schedules`)
- Schedule change requests (`/api/schedule-change-requests`)
- Conflicts (`/api/conflicts`)
- Notifications (`/api/notifications`)
- Settings (`/api/settings`)

Full API documentation is available via Swagger at the `/api/docs` endpoint when the server is running.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/schedexpress-api.git
cd schedexpress-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database connection details and JWT secret.

4. Generate Prisma client:
```bash
npx prisma generate
```

5. Run database migrations:
```bash
npx prisma migrate dev
```

6. Start the development server:
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001/api`.

## Docker Setup

The easiest way to run the application is using Docker:

```bash
# Development mode with hot-reload
npm run docker:dev:up

# Production mode
npm run docker:up
```

For more details, see the [Docker README](README-DOCKER.md).

## Database Integration

This API is designed to work with the same PostgreSQL database as the Next.js frontend application. To connect to an existing database:

1. Set the `DATABASE_URL` in your `.env` file to point to the same database used by the Next.js app.
2. Run `npx prisma generate` to generate the Prisma client based on the existing schema.

## Integration with Next.js Frontend

To integrate this API with the existing Next.js frontend:

1. Update the Next.js frontend API calls to point to this NestJS API instead of the internal Next.js API routes.
2. Set the `NEXT_PUBLIC_API_URL` environment variable in the Next.js app to point to this API (e.g., `http://localhost:3001/api`).
3. Ensure that CORS is properly configured in both applications.

## Authentication

The API uses JWT authentication. To access protected endpoints:

1. Obtain a token by sending a POST request to `/api/auth/login` with email and password.
2. Include the token in the Authorization header of subsequent requests:
```
Authorization: Bearer <token>
```

## Role-Based Authorization

The API implements role-based access control with three roles:

- `STUDENT`: Can view their own schedules and create change requests
- `COUNSELOR`: Can review and approve/deny change requests
- `ADMIN`: Has full access to all endpoints and functionalities

## Development

### API Documentation

The API is documented using Swagger. To access the documentation:

1. Start the server
2. Navigate to `http://localhost:3001/api/docs`

### Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## Troubleshooting
Common issues addressed in the guide:
- Prisma engine compatibility issues (OpenSSL errors)
- Database connection problems
- Docker configuration issues

## Deployment

The API can be deployed to various cloud platforms:

### Docker Deployment

A Dockerfile is included for containerization:

```bash
# Build the Docker image
docker build -t schedexpress-api .

# Run the container
docker run -p 3001:3001 -d schedexpress-api
```

### Environment Variables for Production

For production, ensure the following environment variables are properly set:

- `NODE_ENV=production`
- `DATABASE_URL` - Production database connection string
- `JWT_SECRET` - Secure random string for JWT signing
- `PORT` - Server port (default is 3001)
- `API_GLOBAL_PREFIX` - API path prefix (default is `/api`)

## License

This project is licensed under the MIT License.
