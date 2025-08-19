import { NextRequest, NextResponse } from 'next/server';

/**
 * CORS configuration interface
 */
export interface CorsOptions {
  origin?: string | string[] | boolean | ((origin: string | null) => boolean);
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
  preflightContinue?: boolean;
  optionsSuccessStatus?: number;
}

/**
 * Default CORS configuration
 */
const DEFAULT_CORS_OPTIONS: CorsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-ID',
    'X-Response-Time'
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
  optionsSuccessStatus: 200
};

/**
 * Production CORS configuration (more restrictive)
 */
const PRODUCTION_CORS_OPTIONS: CorsOptions = {
  origin: [
    'https://townofus.pl',
    'https://www.townofus.pl',
    'https://api.townofus.pl'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type'
  ],
  credentials: true,
  maxAge: 86400,
  optionsSuccessStatus: 200
};

/**
 * Check if origin is allowed based on CORS configuration
 */
function isOriginAllowed(origin: string | null, corsOptions: CorsOptions): boolean {
  const { origin: allowedOrigin } = corsOptions;
  
  if (allowedOrigin === false || !allowedOrigin) {
    return false;
  }
  
  if (allowedOrigin === true) {
    return true;
  }
  
  if (typeof allowedOrigin === 'string') {
    return origin === allowedOrigin;
  }
  
  if (Array.isArray(allowedOrigin)) {
    return origin ? allowedOrigin.includes(origin) : false;
  }
  
  if (typeof allowedOrigin === 'function') {
    return allowedOrigin(origin);
  }
  
  return false;
}

/**
 * Create CORS headers based on request and configuration
 */
function createCorsHeaders(request: NextRequest, corsOptions: CorsOptions): Record<string, string> {
  const headers: Record<string, string> = {};
  const origin = request.headers.get('origin');
  const requestMethod = request.headers.get('access-control-request-method');
  const requestHeaders = request.headers.get('access-control-request-headers');
  
  // Handle origin
  if (isOriginAllowed(origin, corsOptions)) {
    if (corsOptions.origin === true) {
      headers['Access-Control-Allow-Origin'] = origin || '*';
    } else if (typeof corsOptions.origin === 'string') {
      headers['Access-Control-Allow-Origin'] = corsOptions.origin;
    } else if (origin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }
  
  // Handle credentials
  if (corsOptions.credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  // Handle methods
  if (corsOptions.methods && corsOptions.methods.length > 0) {
    headers['Access-Control-Allow-Methods'] = corsOptions.methods.join(', ');
  } else if (requestMethod) {
    headers['Access-Control-Allow-Methods'] = requestMethod;
  }
  
  // Handle allowed headers
  if (corsOptions.allowedHeaders && corsOptions.allowedHeaders.length > 0) {
    headers['Access-Control-Allow-Headers'] = corsOptions.allowedHeaders.join(', ');
  } else if (requestHeaders) {
    headers['Access-Control-Allow-Headers'] = requestHeaders;
  }
  
  // Handle exposed headers
  if (corsOptions.exposedHeaders && corsOptions.exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = corsOptions.exposedHeaders.join(', ');
  }
  
  // Handle max age
  if (corsOptions.maxAge !== undefined) {
    headers['Access-Control-Max-Age'] = corsOptions.maxAge.toString();
  }
  
  return headers;
}

/**
 * Handle CORS preflight request (OPTIONS method)
 */
export function handleCorsPreflightRequest(
  request: NextRequest, 
  corsOptions?: Partial<CorsOptions>
): NextResponse {
  const options = {
    ...(process.env.NODE_ENV === 'production' ? PRODUCTION_CORS_OPTIONS : DEFAULT_CORS_OPTIONS),
    ...corsOptions
  };
  
  const headers = createCorsHeaders(request, options);
  
  return new NextResponse(null, {
    status: options.optionsSuccessStatus || 200,
    headers
  });
}

/**
 * Add CORS headers to an existing response
 */
export function addCorsHeaders(
  response: NextResponse, 
  request: NextRequest, 
  corsOptions?: Partial<CorsOptions>
): NextResponse {
  const options = {
    ...(process.env.NODE_ENV === 'production' ? PRODUCTION_CORS_OPTIONS : DEFAULT_CORS_OPTIONS),
    ...corsOptions
  };
  
  const corsHeaders = createCorsHeaders(request, options);
  
  // Add CORS headers to the response
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  return response;
}

/**
 * CORS middleware wrapper for API routes
 * Usage: export const GET = withCors(async (request) => { ... });
 */
export function withCors<T extends unknown[]>(
  handler: (request: NextRequest, ...args: T) => Promise<Response>,
  corsOptions?: Partial<CorsOptions>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return handleCorsPreflightRequest(request, corsOptions);
    }
    
    // Execute the handler
    const response = await handler(request, ...args);
    
    // Add CORS headers to the response
    const nextResponse = response instanceof NextResponse 
      ? response 
      : new NextResponse(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
    
    return addCorsHeaders(nextResponse, request, corsOptions);
  };
}



/**
 * Utility function to create a CORS-enabled response
 */
export function createCorsResponse(
  body: unknown,
  request: NextRequest,
  init?: ResponseInit,
  corsOptions?: Partial<CorsOptions>
): NextResponse {
  const response = NextResponse.json(body, init);
  return addCorsHeaders(response, request, corsOptions);
}

/**
 * Export default CORS options for consistency
 */
export { DEFAULT_CORS_OPTIONS, PRODUCTION_CORS_OPTIONS };