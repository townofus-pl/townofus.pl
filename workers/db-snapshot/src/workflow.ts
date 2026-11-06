// Cienka klasa Workflow. Cała logika leży w snapshot.ts, bo Node (Jest) nie zna modułów `cloudflare:*`.

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
// NonRetryableError żyje w `cloudflare:workflows`, nie w `cloudflare:workers`.
import { NonRetryableError } from 'cloudflare:workflows';
import { createDeps, runSnapshot } from './snapshot';

export class DbSnapshotWorkflow extends WorkflowEntrypoint<SnapshotEnv> {
    async run(event: Readonly<WorkflowEvent<unknown>>, step: WorkflowStep): Promise<void> {
        await runSnapshot(this.env, step, new Date(event.timestamp), createDeps(NonRetryableError));
    }
}
