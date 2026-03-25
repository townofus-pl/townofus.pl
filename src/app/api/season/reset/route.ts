import { POST } from './post';
import { withAuth } from '../../_middlewares/auth';
import { withCors } from '../../_middlewares/cors';

// Chroniony endpoint — wymaga Basic Auth
const handler = withCors(withAuth(POST));

export { handler as POST };
