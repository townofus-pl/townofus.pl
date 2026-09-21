/**
 * Which settings pair the changelog diffs, and therefore which era it renders.
 *
 * There is one changelog URL. The database holds exactly one live `current` and one live `old` —
 * a two-deep rotation, not a per-season history — so the changelog can only ever show the current
 * diff, and splitting it across two URLs bought nothing. The format of the pair decides the view.
 */
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { looksLikeMiraConfig } from '@/app/dramaafera/_utils/miraConfig';

/**
 * The committed `public/settings/` pair, read through the assets binding.
 *
 * Not a safety net but the season-opening case: `mira_old.cfg` is hand-built to show what changed
 * since the previous season, which no two-deep rotation can reproduce. Temporary — it stops being
 * consulted the moment a second `.cfg` is uploaded.
 */
export async function readSnapshotPair(): Promise<{ current: string; old: string } | null> {
    try {
        const { env } = await getCloudflareContext();
        if (!env.ASSETS) return null;

        const [currentResponse, oldResponse] = await Promise.all([
            env.ASSETS.fetch(new Request('http://localhost/settings/mira.cfg')),
            env.ASSETS.fetch(new Request('http://localhost/settings/mira_old.cfg')),
        ]);
        if (!currentResponse.ok || !oldResponse.ok) return null;

        const [current, old] = await Promise.all([currentResponse.text(), oldResponse.text()]);
        return looksLikeMiraConfig(current) && looksLikeMiraConfig(old) ? { current, old } : null;
    } catch {
        return null;
    }
}
