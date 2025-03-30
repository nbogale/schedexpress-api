# Next.js Integration

This directory contains files to help integrate the NestJS API with the existing Next.js frontend.

## API Proxy Middleware

The `next-api-proxy.js` file can be used to create a middleware in the Next.js app that proxies API requests to this NestJS API. This allows for a smooth transition from the Next.js API routes to the NestJS API without having to update all the API calls in the frontend code.

### How to use:

1. Copy the `next-api-proxy.js` file to your Next.js app as `src/middleware.ts`
2. Configure the API URL in your Next.js `.env` file:
   ```
   API_URL=http://localhost:3001
   ```
3. Start both the Next.js app and this NestJS API

With this middleware in place, all API requests from the Next.js app will be proxied to the NestJS API.

## Direct Integration

For a more direct integration, you can update the API calls in your Next.js app to point to the NestJS API:

```js
// Before
const response = await fetch('/api/users');

// After
const response = await fetch('http://localhost:3001/api/users');
```

You can also use an environment variable to configure the API URL:

```js
// In .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api

// In your code
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
```

## Authentication

The NestJS API uses JWT authentication, which is compatible with the NextAuth.js setup in the Next.js app. You'll need to:

1. Update the NextAuth.js configuration to use the JWT tokens from the NestJS API
2. Pass the JWT token in the Authorization header for API requests

Example:

```js
// In your API client
const fetchWithAuth = async (url, options = {}) => {
  const session = await getSession();
  
  if (session?.accessToken) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    };
  }
  
  return fetch(url, options);
};
```

## CORS Configuration

The NestJS API is configured to allow CORS from all origins in development. For production, you should update the CORS configuration in `src/main.ts` to only allow requests from your frontend domain.
