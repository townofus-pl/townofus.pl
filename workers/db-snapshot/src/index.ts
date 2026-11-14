// Punkt wejścia. Worker nie ma trasy: bez domyślnego handlera `fetch`, więc żadne żądanie HTTP nie
// ma tu obsługi (poza tym `workers_dev = false` i `preview_urls = false`). Harmonogram uruchamia
// Workflow (`schedules` w wrangler.toml), a start ręczny idzie przez `wrangler workflows trigger`.
// Dry run przechodzi bez domyślnego eksportu. Czy wdrożenie go nie wymaga, pokaże staging.

export { DbSnapshotWorkflow } from './workflow';
