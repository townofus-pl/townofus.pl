import { withAuth, withCors } from '@/app/api/_middlewares';
import { POST as postHandler } from './post';

// The endpoint the mod POSTs at (`ApiClient.SubmitPath = "/api/v2/games"`), Basic-auth'd.
// Not registered with `openApiRegistry`: the OpenAPI document describes the v1 surface, and the
// payload contract lives in the mod's own `game_data.schema.json`, which is the authority here.
export const POST = withCors(withAuth(postHandler));
