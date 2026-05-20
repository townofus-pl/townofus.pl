import { withAuth, withCors } from '@/app/api/_middlewares';
import { GET as getHandler } from './get';
import { POST as postHandler } from './upload';

// GET is public - wrap with CORS
const GET = withCors(getHandler);

// POST - wrap with CORS and Auth
const POST = withCors(withAuth(postHandler));

export { GET, POST };
