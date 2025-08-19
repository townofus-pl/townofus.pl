import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createErrorResponse, createSuccessResponse } from '@/app/api/_utils';
import { withAuth, withCors } from '@/app/api/_middlewares';
import { initializeZapisyData } from '../init';

// POST /api/dramaafera/zapisy/initialize - Initialize zapisy data
export const POST = withCors(withAuth(async (request: NextRequest) => {
  // Get Cloudflare context for environment bindings
  const { env } = await getCloudflareContext();
  
  try {
    // Get DB from Cloudflare environment
    if (!env?.DB) {
      return createErrorResponse('Database not available', 500);
    }

    const result = await initializeZapisyData(env.DB);

    return createSuccessResponse(result);

  } catch (error) {
    console.error('Error initializing zapisy data:', error);
    return createErrorResponse('Failed to initialize zapisy data', 500);
  }
}));
