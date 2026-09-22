import Image from "next/image";
import Link from "next/link";

/**
 * Not-found boundary for the whole /dramaafera segment.
 *
 * Without one, `notFound()` thrown from a page in this segment had nowhere to land: the
 * segment's `loading.tsx` opens an implicit Suspense boundary, the shell is flushed with HTTP
 * 200, and the fallback then stays on screen forever — so an unknown player or an unknown date
 * rendered as a permanent "Ładowanie...". See #310.
 */
export default function DramaAferaNotFound() {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="inline-block text-center mt-0 sm:mt-20 mx-auto">
                <Image
                    src="/images/404.png"
                    alt="Detective"
                    width={200}
                    height={200}
                    className="inline-block scale-125 drop-shadow-2xl"
                />
                <h3 className="font-brook text-6xl drop-shadow-md">Nic tu nie ma</h3>
                <p className="mt-8 text-2xl drop-shadow-md">
                    Nie znaleźliśmy tego gracza, gry ani dnia.
                </p>
                <Link
                    href="/dramaafera/ranking"
                    className="mt-8 inline-block font-barlow text-cyan-400 hover:text-cyan-300 underline"
                >
                    Wróć do rankingu
                </Link>
            </div>
        </div>
    );
}
