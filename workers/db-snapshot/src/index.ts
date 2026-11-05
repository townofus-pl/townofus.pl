// Punkt wejścia. Worker nie ma publicznej trasy: `fetch` zawsze zwraca 404.
// Harmonogram uruchamia Workflow (`schedules` w wrangler.toml), nie handler `scheduled`.

import type { SnapshotEnv } from './env';
import { handleFetch } from './handler';

export { DbSnapshotWorkflow } from './workflow';

export default {
    async fetch(): Promise<Response> {
        return handleFetch();
    },
} satisfies ExportedHandler<SnapshotEnv>;
