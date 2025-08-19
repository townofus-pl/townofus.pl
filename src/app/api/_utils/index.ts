import { NextResponse } from 'next/server';

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
