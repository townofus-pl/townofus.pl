'use client';

import { useRouter, usePathname } from 'next/navigation';
import { SEASONS } from '../../_constants/seasons';
import { useSeason } from '../../_hooks/useSeason';
import { extractDramaAferaSubPath, buildSeasonUrl } from '../../_utils/seasonHelpers';

export default function SeasonSwitcher({ className }: { className?: string }) {
    const router = useRouter();
    const pathname = usePathname();
    const currentSeason = useSeason();

    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSeasonId = parseInt(event.target.value, 10);
        const subPath = extractDramaAferaSubPath(pathname);
        router.push(buildSeasonUrl(subPath, newSeasonId));
    };

    return (
        <div className={['w-full md:w-fit', className].filter(Boolean).join(' ')}>
            <select
                value={currentSeason}
                onChange={handleChange}
                className="appearance-none font-barlow text-base bg-zinc-800/80 bg-chevron-gray bg-no-repeat bg-[position:right_0.6rem_center] bg-[size:1.1rem] border border-zinc-700 text-gray-400 rounded-md pl-4 pr-9 py-2 cursor-pointer hover:border-zinc-500 hover:text-gray-300 transition-colors duration-200 focus:outline-none focus:border-zinc-500 w-full"
                aria-label="Wybierz sezon"
            >
                {SEASONS.map((season) => (
                    <option key={season.id} value={season.id}>
                        Sezon {season.id}
                    </option>
                ))}
            </select>
        </div>
    );
}
