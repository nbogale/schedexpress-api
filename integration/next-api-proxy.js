/**
 * This file can be used in the Next.js app to proxy API requests to the NestJS API
 * Copy this file to your Next.js app's src/middleware.ts file
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// API routes that should be proxied to the NestJS API
const API_ROUTES = [
  '/api/auth',
  '/api/users',
  '/api/courses',
  '/api/schedules',
  '/api/schedule-change-requests',
  '/api/conflicts',
  '/api/notifications',
  '/api/settings',
];

// The URL of the NestJS API
const API_URL = process.env.API_URL || 'http://localhost:3001';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for an API route that should be proxied
  const shouldProxy = API_ROUTES.some(route => pathname.startsWith(route));

  if (shouldProxy) {
    // Create a new URL for the proxy request
    const url = new URL(pathname, API_URL);
    
    // Copy all search parameters
    request.nextUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value);
    });

    // Create a new request to proxy
    const proxyRequest = new Request(url, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });

    // Return the proxied request as a rewrite
    return NextResponse.rewrite(proxyRequest.url);
  }

  // For all other requests, continue with the normal Next.js routing
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
