import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * Constant-time string comparison using SHA-256 digests.
 *
 * Hashing first guarantees both inputs end up at the same fixed length so the
 * pairwise XOR loop reveals nothing about either input's length or content,
 * regardless of which Workers/Node runtime executes it. `crypto.subtle.digest`
 * is standard Web Crypto API — available in both Cloudflare Workers and the
 * Node-based `next dev` runtime.
 */
async function timingSafeStringEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [aHashBuf, bHashBuf] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(a)),
    crypto.subtle.digest('SHA-256', enc.encode(b)),
  ]);
  const aHash = new Uint8Array(aHashBuf);
  const bHash = new Uint8Array(bHashBuf);
  let mismatch = 0;
  for (let i = 0; i < aHash.length; i++) {
    mismatch |= aHash[i] ^ bHash[i];
  }
  return mismatch === 0;
}

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
 * HTTP Basic Authentication against `Headers`.
 *
 * Extracted so callers without a `NextRequest` (e.g. Server Actions reading
 * via `next/headers`) can perform the same check. Returns `{ success: true }`
 * with the resolved username on success, or a NextResponse with the right
 * status code on failure.
 */
export async function authenticateHeaders(reqHeaders: Headers): Promise<AuthResult> {
  try {
    // Get Cloudflare context for environment variables
    const { env } = await getCloudflareContext();

    // Get credentials from environment
    const validUsername = (env as unknown as Record<string, string>)?.API_USERNAME || process.env.API_USERNAME;
    const validPassword = (env as unknown as Record<string, string>)?.API_PASSWORD || process.env.API_PASSWORD;

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
    const authHeader = reqHeaders.get('Authorization');

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

      // Validate credentials with constant-time comparison to avoid timing
      // side-channels. Both compares run unconditionally to completion.
      const [usernameMatch, passwordMatch] = await Promise.all([
        timingSafeStringEqual(username ?? '', validUsername),
        timingSafeStringEqual(password ?? '', validPassword),
      ]);

      if (!usernameMatch || !passwordMatch) {
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
 * HTTP Basic Authentication for API routes — thin wrapper around
 * `authenticateHeaders` for callers that already have a `NextRequest`.
 */
export async function authenticateApiRequest(request: NextRequest): Promise<AuthResult> {
  return authenticateHeaders(request.headers);
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
