// Scoped deliberately to this route rather than the whole /dramaafera segment.
//
// A `loading.tsx` opens an implicit Suspense boundary, and Next flushes the shell with HTTP 200
// as soon as it exists. Any `notFound()` thrown below that point can no longer change the status
// or the markup — the fallback simply stays on screen forever. A section-wide boundary therefore
// turned every unknown player, date, game and role into a permanent "Ładowanie...". Verified:
// removing it made the same URL return a real 404. So this boundary lives only above routes that
// cannot 404. See #310.

export default function Loading() {
    return (
        <div
            className="flex flex-col items-center justify-center min-h-[50vh]"
            role="status"
            aria-live="polite"
        >
            <div
                className="motion-safe:animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mb-4"
                aria-hidden="true"
            />
            <p className="text-zinc-400 font-barlow">Ładowanie...</p>
        </div>
    );
}
