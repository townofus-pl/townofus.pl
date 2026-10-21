import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { GET } from './route';

jest.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: jest.fn() }));

const USER = 'host';
const PASS = 'secret';

/** A minimal R2 bucket: `get` gives the stored body, or null when the key is absent. */
function bucket(objects: Record<string, string>) {
  return {
    get: jest.fn(async (key: string) => {
      if (!(key in objects)) return null;
      return {
        body: new Blob([objects[key]]).stream(),
        httpEtag: `"etag-${key}"`,
        writeHttpMetadata: (headers: Headers) => headers.set('Content-Type', 'application/json'),
      };
    }),
  };
}

function request(name: string, auth?: string) {
  const headers = new Headers();
  if (auth) headers.set('Authorization', `Basic ${Buffer.from(auth).toString('base64')}`);
  return new NextRequest(`http://localhost/api/mod/host/${name}`, { headers });
}

function call(name: string, auth?: string) {
  return GET(request(name, auth), { params: Promise.resolve({ name }) });
}

let files: ReturnType<typeof bucket>;

beforeEach(() => {
  files = bucket({ 'latest.json': '{"version":"1.2.0","files":[]}' });
  (getCloudflareContext as jest.Mock).mockResolvedValue({
    env: { API_USERNAME: USER, API_PASSWORD: PASS, HOST_FILES: files },
  });
});

describe('GET /api/mod/host/[name]', () => {
  it('gives 401 with no Authorization header', async () => {
    const response = await call('latest.json');
    expect(response.status).toBe(401);
    expect(files.get).not.toHaveBeenCalled();
  });

  it('gives 401 for a wrong password', async () => {
    const response = await call('latest.json', `${USER}:wrong`);
    expect(response.status).toBe(401);
    expect(files.get).not.toHaveBeenCalled();
  });

  it('gives 404 for a name outside the fixed list, and does not read the bucket', async () => {
    for (const name of ['other.dll', 'latest.JSON', '..%2Flatest.json', 'DramaAferaStats.Client.dll']) {
      const response = await call(name, `${USER}:${PASS}`);
      expect(response.status).toBe(404);
    }
    expect(files.get).not.toHaveBeenCalled();
  });

  it('gives 404 for a name on the list with no object in the bucket', async () => {
    const response = await call('DramaAferaStats.Host.dll', `${USER}:${PASS}`);
    expect(response.status).toBe(404);
    expect(files.get).toHaveBeenCalledWith('DramaAferaStats.Host.dll');
  });

  it('streams the object with no-store and the etag', async () => {
    const response = await call('latest.json', `${USER}:${PASS}`);
    expect(response.status).toBe(200);
    expect(response.headers.get('Cache-Control')).toBe('private, no-store');
    expect(response.headers.get('etag')).toBe('"etag-latest.json"');
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.text()).toBe('{"version":"1.2.0","files":[]}');
  });
});
