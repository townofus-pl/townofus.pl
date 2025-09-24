import { withCors } from '@/app/api/_middlewares';
import { createRedirectResponse } from '@/app/api/_utils';

// GET /api - API information (no auth required)
export const GET = withCors(async (request) => {
  return createRedirectResponse('/api/docs', request);
});
