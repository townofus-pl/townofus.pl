// Skrypt Workera dla testu z prawdziwym workerd (Miniflare). esbuild pakuje go razem z src/snapshot.ts.
// Cały przebieg (eksport, kontrola, latest.sql) idzie przez runSnapshot. Pobieranie z podpisanego adresu idzie prawdziwym fetch do lokalnego serwera HTTP, a zapis do
// prawdziwego bindingu R2. Odpowiedź API eksportu jest podstawiona.

import { runSnapshot, type SnapshotDeps } from '../src/snapshot';

export default {
    async fetch(request: Request, env: SnapshotEnv): Promise<Response> {
        const params = new URL(request.url).searchParams;
        const signedUrl = params.get('signedUrl')!;
        const deps: SnapshotDeps = {
            fetch: (input, init) =>
                String(input).includes('/export')
                    ? Promise.resolve(Response.json({ success: true, result: { status: 'complete', result: { signed_url: signedUrl } } }))
                    : fetch(input, init),
            sleep: async () => {},
            NonRetryableError: class extends Error {},
        };
        try {
            // Krok bez ponowień: wywołuje funkcję od razu.
            const step = { do: (_name: string, _config: unknown, callback: () => Promise<unknown>) => callback() };
            const result = await runSnapshot(
                { ...env, ACCOUNT_ID: 'a', DATABASE_ID: 'd', D1_EXPORT_TOKEN: 't' },
                step as never,
                new Date('2026-11-12T03:20:00Z'),
                deps,
            );
            return Response.json({ ok: true, result });
        } catch (error) {
            return Response.json({ ok: false, error: error instanceof Error ? error.message : String(error) });
        }
    },
};
