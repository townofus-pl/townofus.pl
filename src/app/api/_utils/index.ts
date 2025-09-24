import { NextRequest, NextResponse } from 'next/server';

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create a successful API response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data
  };

  return NextResponse.json(response, { status });
}

/**
 * Create an error API response
 */
export function createErrorResponse(
  error: string,
  status: number = 400
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a message-only response (for operations like delete)
 */
export function createMessageResponse(
  message: string,
  status: number = 200
): NextResponse {
  const response: ApiResponse = {
    success: true,
    message
  };

  return NextResponse.json(response, { status });
}

/**
 * Create a redirect response
 */
export function createRedirectResponse(
  url: string,
  request?: NextRequest,
  status: number = 302
): NextResponse {
  // Handle relative URLs by constructing absolute URL
  if (url.startsWith('/')) {
    const baseUrl = request ? new URL(request.url).origin : 'http://localhost:3000';
    return NextResponse.redirect(new URL(url, baseUrl), status);
  }
  return NextResponse.redirect(url, status);
}
