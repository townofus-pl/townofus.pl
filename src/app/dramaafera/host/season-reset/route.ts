import { withHostAuth } from '@/app/api/_middlewares/hostAuth';
import { POST as handler } from '@/app/api/season/reset/post';
export const POST = withHostAuth(handler);
