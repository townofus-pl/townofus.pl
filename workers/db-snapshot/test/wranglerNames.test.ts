// Pilnuje nazw w wrangler.toml. `dry-run` ich nie wypisuje, a pomyłka (np. nazwa `-dev` w bloku
// production) wdrożyłaby produkcyjnego Workera pod złą nazwą albo nadpisała go wersją bez bindingów.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Zbiera `name = "..."` pod nagłówkiem sekcji. Wystarcza dla tego pliku. */
function namesBySection(toml: string): Record<string, string> {
    const names: Record<string, string> = {};
    let section = '';
    for (const raw of toml.split('\n')) {
        const line = raw.trim();
        const header = line.match(/^\[+([^\]]+)\]+$/);
        if (header) {
            section = header[1];
            continue;
        }
        const name = line.match(/^name\s*=\s*"([^"]+)"/);
        if (name) names[section] = name[1];
    }
    return names;
}

const names = namesBySection(readFileSync(join(__dirname, '../wrangler.toml'), 'utf8'));

describe('wrangler.toml names', () => {
    it('top level is a dev name, so a deploy without --env cannot hit production', () => {
        expect(names['']).toMatch(/-dev$/);
    });

    it('production Worker and Workflow are exactly townofus-db-snapshot', () => {
        expect(names['env.production']).toBe('townofus-db-snapshot');
        expect(names['env.production.workflows']).toBe('townofus-db-snapshot');
    });

    it('staging Worker and Workflow end with -staging', () => {
        expect(names['env.staging']).toBe('townofus-db-snapshot-staging');
        expect(names['env.staging.workflows']).toBe('townofus-db-snapshot-staging');
    });

    it('no two environments share a name', () => {
        const worker = [names[''], names['env.staging'], names['env.production']];
        const workflow = [names['env.staging.workflows'], names['env.production.workflows']];
        expect(new Set(worker).size).toBe(worker.length);
        expect(new Set(workflow).size).toBe(workflow.length);
        expect(Object.keys(names).sort()).toEqual(['', 'env.production', 'env.production.workflows', 'env.staging', 'env.staging.workflows']);
    });
});
