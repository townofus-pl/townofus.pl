import Image from 'next/image';

export function SettingsChangesCard({ name, color, icon, changes }: {
    name: string; color: string; icon: string | null;
    changes: Array<{ name: string; before: string; after: string }>;
}) {
    return <div className="rounded-xl bg-zinc-900/50 p-6 text-white">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center">
                {icon ? <Image src={icon} alt={name} width={80} height={80} quality={100} unoptimized
                    className="h-20 w-20 shrink-0 scale-[1.3] rounded-lg object-contain" /> : <span className="text-6xl">⚙️</span>}
            </div>
            <div className="min-w-0 flex-1">
                <h2 className="mb-4 font-brook text-4xl" style={{ color }}>{name}</h2>
                <ul className="space-y-2">
                    {changes.map((change, index) => <li key={`${change.name}-${index}`} className="break-words text-xl">
                        <span className="font-semibold">{change.name}:</span>{' '}
                        <span className="text-red-600">{change.before}</span>{' '}→{' '}
                        <span className="text-green-600">{change.after}</span>
                    </li>)}
                </ul>
            </div>
        </div>
    </div>;
}
