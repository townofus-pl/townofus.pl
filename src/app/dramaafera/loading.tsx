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
