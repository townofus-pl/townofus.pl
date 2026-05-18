import { handler as getHandler } from './get';
import { POST as uploadPost } from './upload';

export const GET = getHandler;
export { uploadPost as POST };
