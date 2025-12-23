import { withCors } from '../../_middlewares/cors';
import { GET as getHandler } from './get';

// Apply CORS middleware
export const GET = withCors(getHandler);
