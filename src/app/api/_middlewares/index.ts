/**
 * API Middleware
 * 
 * This module provides authentication and CORS middleware for API routes.
 * Only exports functions that are actually used in the application.
 */

export { authenticateApiRequest, withAuth } from './auth';
export { 
  withCors, 
  handleCorsPreflightRequest, 
  addCorsHeaders, 
  createCorsResponse,
  DEFAULT_CORS_OPTIONS,
  PRODUCTION_CORS_OPTIONS
} from './cors';