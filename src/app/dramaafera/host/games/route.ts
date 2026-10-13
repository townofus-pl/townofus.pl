import { withHostAuth } from '@/app/api/_middlewares/hostAuth';
import { POST as handler } from '@/app/api/v2/games/post';
export const POST = withHostAuth(handler);
