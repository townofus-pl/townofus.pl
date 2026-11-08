import Image from 'next/image';
import Link from 'next/link';
import { getPlayerAvatarPath, convertNickToUrlSlug } from '../../_utils/gameUtils';
import { buildSeasonUrl } from '../../_utils/seasonHelpers';
import type { KillStatistics } from '../../_services/players/getPlayerKillStats';

export default function KillStatsDisplay({ stats, playerName, seasonId, category = 'kills' }: { category?: 'kills' | 'guesses' | 'protects'; stats: KillStatistics; playerName: string; seasonId: number }) {
  const guesses = category === 'guesses';
  const protects = category === 'protects';
  if (!stats.available) return <p className="text-sm text-zinc-400">{protects ? 'Brak szczegółowych danych o ochronie w tym sezonie.' : guesses ? 'Brak szczegółowych danych o guessach w tym sezonie.' : 'Brak szczegółowych danych o zabójstwach w tym sezonie.'}</p>;
  const avatar = (name: string) => <Image src={getPlayerAvatarPath(name)} alt="" width={24} height={24} className="h-6 w-6 shrink-0 rounded-full object-cover" />;
  const link = (name: string) => <Link href={buildSeasonUrl(`/user/${convertNickToUrlSlug(name)}`, seasonId)} className="font-semibold hover:underline">{name}</Link>;
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[[protects ? 'Udzielonych ochron' : guesses ? 'Poprawnych guessów' : 'Zabójstw', stats.kills], [protects ? 'Otrzymanych ochron' : guesses ? 'Razy poprawnie zguessowany' : 'Razy zabity', stats.killed]].map(([label, count], index) => (
          <div key={label} className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
            <div className={`text-3xl font-bold ${index === 0 ? 'text-blue-400' : 'text-purple-400'} mb-1`}>{count}</div>
            <div className="text-sm text-zinc-400 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[{ label: protects ? 'Kogo chroni' : guesses ? 'Kogo guessuje' : 'Kogo zabija', entries: stats.targets, total: stats.kills, color: 'text-blue-400' }, { label: protects ? 'Kto chroni' : guesses ? 'Kto guessuje' : 'Kto zabija', entries: stats.killers, total: stats.killed, color: 'text-purple-400' }].map(({ label, entries, total, color }) => (
          <div key={label} className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="flex flex-wrap items-center gap-2 text-lg font-bold mb-4 text-white">
              <span>{label}</span>{avatar(playerName)}{link(playerName)}:
            </h4>
            <div className="space-y-2">
              {entries.map(({ playerName: name, count }, index) => (
                <div key={name} className="flex items-center justify-between gap-2 bg-zinc-900/50 rounded p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-sm w-6">{index + 1}.</span>
                    {avatar(name)}{link(name)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`${color} font-bold`}>{count}</span>
                    <span className="text-zinc-500 text-sm">
                      ({(total > 0 ? count / total * 100 : 0).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
              {entries.length === 0 && <p className="text-sm text-zinc-400">{protects ? 'Brak ochron.' : guesses ? 'Brak poprawnych guessów.' : 'Brak zabójstw.'}</p>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
