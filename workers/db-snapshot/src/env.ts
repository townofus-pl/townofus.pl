// Bindingi, zmienne i sekrety z wrangler.toml. Trzymaj w zgodzie z każdym blokiem [env.*].
export interface SnapshotEnv {
    /** Prywatny bucket R2. Jedyny dostęp do niego to ten binding. */
    SNAPSHOTS: R2Bucket;
    SNAPSHOT_WORKFLOW: Workflow;

    /** "staging" | "production". */
    ENVIRONMENT: string;
    ACCOUNT_ID: string;
    DATABASE_ID: string;

    /** Token C: eksport D1. Sekret Workera, nie zmienna. */
    D1_EXPORT_TOKEN: string;
}
