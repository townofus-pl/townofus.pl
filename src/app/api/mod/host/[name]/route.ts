import { withAuth } from '@/app/api/_middlewares';
import { GET as getHandler } from './get';

// The host plugin's updater calls this, never a browser, so there is no CORS. Not registered with
// `openApiRegistry`: the files are for the hosts only.
export const GET = withAuth(getHandler);
