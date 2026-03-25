import { withAuth, withCors } from '../../_middlewares';
import { POST as postHandler } from './post';

export const POST = withCors(withAuth(postHandler));
