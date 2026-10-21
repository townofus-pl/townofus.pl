import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * The only keys the route gives out. The mod's `publish-host.sh` writes them to the `HOST_FILES`
 * bucket: both DLLs first, the manifest last. Any other name is a 404, so the route never lists the
 * bucket and never reads a key that a caller chose.
 */
export const HOST_FILE_NAMES = ['latest.json', 'DramaAferaStats.Host.dll', 'DramaAferaStats.Logic.dll'] as const;

interface RouteContext {
  params: Promise<{ name: string }>;
}

/** The `createErrorResponse` shape. The `_utils` barrel is not imported, because it loads Prisma. */
function notFound(): NextResponse {
  return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}

function isHostFileName(name: string): name is (typeof HOST_FILE_NAMES)[number] {
  return (HOST_FILE_NAMES as readonly string[]).includes(name);
}

/**
 * GET /api/mod/host/{name} — one file of the host plugin, from R2.
 *
 * The host files are for the hosts only, so `route.ts` puts this handler behind `withAuth`. The
 * body is a stream of the R2 object. `no-store` keeps the manifest and the DLLs out of every cache,
 * so a new release is visible on the next request.
 */
export async function GET(_request: NextRequest, _authContext: { user: { username: string } }, routeContext: RouteContext) {
  const { name } = await routeContext.params;
  if (!isHostFileName(name)) {
    return notFound();
  }

  const { env } = await getCloudflareContext();
  const object = await env.HOST_FILES.get(name);
  if (!object) {
    return notFound();
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', name.endsWith('.json') ? 'application/json' : 'application/octet-stream');
  }
  headers.set('etag', object.httpEtag);
  headers.set('Cache-Control', 'private, no-store');

  return new Response(object.body, { status: 200, headers });
}
