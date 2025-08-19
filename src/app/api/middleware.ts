import { NextRequest, NextResponse } from 'next/server';
import { authenticateApiRequest } from './_middlewares/auth';
import { 
  handleCorsPreflightRequest, 
  addCorsHeaders,
  DEFAULT_CORS_OPTIONS,
  PRODUCTION_CORS_OPTIONS
} from './_middlewares/cors';

/**
 * Global API Middleware
 * 
 * This middleware runs on all /api routes and handles:
 * - HTTP Basic Authentication for all API endpoints
 * - CORS headers for cross-origin requests
 * - Request logging in development
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Main middleware function
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;
  
  // Log requests in development
  if (isDevelopment) {
    const timestamp = new Date().toISOString().substring(11, 23);
    console.log(`[${timestamp}] ${method} ${pathname}`);
  }

  // Handle CORS preflight requests (no auth required for OPTIONS)
  if (method === 'OPTIONS') {
    const corsOptions = isDevelopment ? DEFAULT_CORS_OPTIONS : PRODUCTION_CORS_OPTIONS;
    return handleCorsPreflightRequest(request, corsOptions);
  }

  // Authenticate all non-OPTIONS requests
  const authResult = await authenticateApiRequest(request);
  
  if (!authResult.success) {
    // Add CORS headers to auth error responses too
    const errorResponse = authResult.response!;
    const corsOptions = isDevelopment ? DEFAULT_CORS_OPTIONS : PRODUCTION_CORS_OPTIONS;
    return addCorsHeaders(errorResponse as NextResponse, request, corsOptions);
  }

  // Authentication successful - continue to the route handler
  const response = NextResponse.next();
  
  // Add CORS headers to successful requests
  const corsOptions = isDevelopment ? DEFAULT_CORS_OPTIONS : PRODUCTION_CORS_OPTIONS;
  addCorsHeaders(response, request, corsOptions);
  
  if (isDevelopment) {
    // Add request timing header in development
    response.headers.set('X-Request-Time', new Date().toISOString());
    response.headers.set('X-Authenticated-User', authResult.user?.username || 'unknown');
  }
  
  return response;
}

/**
 * Configure which paths this middleware should run on
 */
export const config = {
  matcher: [
    '/api/:path*',
  ],
};