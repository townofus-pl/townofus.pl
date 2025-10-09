import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Authentication result interface
 */
export interface AuthResult {
  success: boolean;
  response?: NextResponse;
  user?: {
    username: string;
  };
}

/**
 * HTTP Basic Authentication for API routes
 * Validates credentials against environment variables
 */
export async function authenticateApiRequest(request: NextRequest): Promise<AuthResult> {
  try {
    // Get Cloudflare context for environment variables
    const { env } = await getCloudflareContext();
    
    // Get credentials from environment
    const validUsername = (env as any)?.API_USERNAME || process.env.API_USERNAME;
    const validPassword = (env as any)?.API_PASSWORD || process.env.API_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error('API authentication not configured - missing API_USERNAME or API_PASSWORD');
      return {
        success: false,
        response: createErrorResponse(
          'Authentication not configured',
          'API credentials are not properly set up',
          500
        )
      };
    }

    // Get Authorization header
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return {
        success: false,
        response: createAuthResponse('Missing Authorization header')
      };
    }

    if (!authHeader.startsWith('Basic ')) {
      return {
        success: false,
        response: createAuthResponse('Invalid authorization type. Expected Basic authentication.')
      };
    }

    try {
      // Extract and decode credentials
      const base64Credentials = authHeader.substring(6); // Remove 'Basic ' prefix
      const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [username, password] = credentials.split(':');

      // Validate credentials
      if (username !== validUsername || password !== validPassword) {
        return {
          success: false,
          response: createAuthResponse('Invalid credentials')
        };
      }

      // Authentication successful
      return { 
        success: true,
        user: { username }
      };

    } catch {
      return {
        success: false,
        response: createAuthResponse('Invalid authorization header format')
      };
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return {
      success: false,
      response: createErrorResponse(
        'Internal server error',
        'Authentication middleware encountered an error',
        500
      )
    };
  }
}

/**
 * Middleware wrapper for API routes that require authentication
 * Usage: export const GET = withAuth(async (request, { user }) => { ... });
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, context: { user: { username: string } }, ...args: T) => Promise<Response>
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    const authResult = await authenticateApiRequest(request);
    
    if (!authResult.success) {
      return authResult.response!;
    }

    return handler(request, { user: authResult.user! }, ...args);
  };
}

/**
 * Create a 401 authentication response
 */
function createAuthResponse(message: string): NextResponse {
  return new NextResponse(
    JSON.stringify({ 
      error: message,
      hint: 'Use Basic Authentication with valid API credentials'
    }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': 'Basic realm="TownOfUs.pl API"',
      },
    }
  );
}

/**
 * Create a generic error response
 */
function createErrorResponse(error: string, hint: string, status: number): NextResponse {
  return new NextResponse(
    JSON.stringify({ error, hint }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
