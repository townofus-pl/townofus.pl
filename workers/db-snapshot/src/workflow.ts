// Cienka klasa Workflow. Cała logika leży w snapshot.ts, bo Node (Jest) nie zna `cloudflare:workers`.

import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import type { SnapshotEnv } from './env';
import { runSnapshot } from './snapshot';

export class DbSnapshotWorkflow extends WorkflowEntrypoint<SnapshotEnv> {
    async run(event: Readonly<WorkflowEvent<unknown>>, step: WorkflowStep): Promise<void> {
        await runSnapshot(this.env, step, new Date(event.timestamp));
    }
}
