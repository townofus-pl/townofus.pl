import { withCors } from '../../_middlewares/cors';
import { GET as getHandler } from './get';

// Apply CORS middleware without auth - public endpoint
export const GET = withCors(getHandler);
