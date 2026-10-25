import Image from 'next/image';
import Link from 'next/link';
import type { UIMeetingData, UIPlayerData } from '@/app/dramaafera/_services/games/types';
import { convertNickToUrlSlug, getPlayerAvatarPath, getRoleIconPath, getRoleColor, convertRoleNameForDisplay } from '@/app/dramaafera/_utils/gameUtils';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { getMeetingParticipants } from '@/app/dramaafera/_utils/meetingParticipants';

function Player({ name, seasonId, count = 1, player, compact = false, avatarOnly = false, blackmailed = false, jailed = false, suppressBlackmailOverlay = false }: { name: string; seasonId: number; count?: number; player?: UIPlayerData; compact?: boolean; avatarOnly?: boolean; blackmailed?: boolean; jailed?: boolean; suppressBlackmailOverlay?: boolean }) {
    const roles = player?.roleHistory?.length ? player.roleHistory : player ? [player.role] : [];
    return (
        <Link href={buildSeasonUrl(`/user/${convertNickToUrlSlug(name)}`, seasonId)}
            aria-label={avatarOnly ? `${name} — ${roles.map(convertRoleNameForDisplay).join(" → ")}${count > 1 ? `, ${count} głosy` : ""}` : undefined}
            className={`group relative inline-flex max-w-full items-center rounded-lg border border-white/10 bg-black/20 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${avatarOnly ? 'shrink-0 flex-col gap-1 p-1 text-xs hover:z-30 focus:z-30 sm:flex-row sm:gap-0' : compact ? 'overflow-hidden gap-2 px-2 py-1 text-xs' : 'overflow-hidden gap-3 px-3 py-2 text-sm'}`}>
            <span className={`relative shrink-0 ${compact ? 'h-8 w-8' : 'h-12 w-12'}`}>
                <Image src={getPlayerAvatarPath(name)} alt="" width={compact ? 32 : 48} height={compact ? 32 : 48} className="h-full w-full rounded-full" />
                {blackmailed && <Image src="/images/mira/abilities/BlackmailLetter.png" alt="Uciszony przez Blackmailera" title="Uciszony przez Blackmailera" width={compact ? 24 : 32} height={compact ? 24 : 32} className="absolute bottom-0 left-1/2 -translate-x-1/2 object-contain" />}
                {jailed && <Image src="/images/mira/abilities/InJail.png" alt="Uwięziony" title="Uwięziony" width={compact ? 32 : 48} height={compact ? 32 : 48} className="absolute inset-0 h-full w-full object-contain" />}
            </span>
            <span className={`min-w-0 text-center ${avatarOnly ? "pointer-events-none absolute bottom-full left-1/2 z-30 mb-1 hidden w-max max-w-64 -translate-x-1/2 translate-y-1 sm:block rounded-lg border border-white/20 bg-zinc-900 px-3 py-2 opacity-0 shadow-xl transition-[opacity,transform] duration-200 ease-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100 motion-reduce:transition-none" : ""}`}>
                <span className={`flex flex-wrap items-center justify-center gap-1 ${compact ? 'mb-0.5 text-[10px]' : 'mb-1 text-xs'}`} aria-label="Historia ról gracza">
                    {roles.length ? roles.map((role, index) => (
                        <span key={`${role}-${index}`} className="inline-flex items-center gap-1" style={{ color: getRoleColor(role, seasonId) }}>
                            {index > 0 && <span className="mr-1 text-gray-400">→</span>}
                            <Image src={getRoleIconPath(role, seasonId)} alt="" width={compact ? 12 : 16} height={compact ? 12 : 16} className={`object-contain ${compact ? 'h-3 w-3' : 'h-4 w-4'}`} />
                            {convertRoleNameForDisplay(role)}
                        </span>
                    )) : <span className="text-gray-400">Nieznana rola</span>}
                </span>
                <span className={`block font-semibold ${avatarOnly ? "whitespace-nowrap" : "break-all"}`}>{name}</span>
            </span>
            {avatarOnly && <span className="max-w-20 break-all text-center text-[10px] leading-tight sm:hidden">{name}</span>}
            {count > 1 && <span className="text-cyan-300" aria-label={`${count} głosy`}>×{count}</span>}
            {blackmailed && !suppressBlackmailOverlay && <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-red-500/20" />}
        </Link>
    );
}

export function MeetingsSection({ meetings, seasonId, playersData }: { meetings: UIMeetingData[]; seasonId: number; playersData: UIPlayerData[] }) {
    const playersByName = new Map(playersData.map(player => [player.nickname, player]));
    const participantsByMeeting = getMeetingParticipants(meetings, playersData.map(player => player.nickname));
    return (
        <section className="mb-8 font-barlow" aria-labelledby="meetings-heading">
            <h2 id="meetings-heading" className="mb-4 font-brook text-3xl">Spotkania i głosowania</h2>
            {meetings.length === 0 && <p className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 text-gray-400">Brak zapisanych spotkań w tej grze.</p>}
            <div className="space-y-5">
                {meetings.map(meeting => {
                    const targets = Object.entries(meeting.votes).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'pl'));
                    const totalVotes = targets.reduce((sum, [, voters]) => sum + voters.length, 0) + meeting.skipVotes.length;
                    const votersCount = new Set([...targets.flatMap(([, voters]) => voters), ...meeting.skipVotes]).size;
                    // Use the recorded meeting participants rather than the game's full roster:
                    // players who died earlier must not appear as zero-vote candidates.
                    const participants = new Set([
                        ...(participantsByMeeting.get(meeting.meetingNumber) ?? []),
                        ...targets.flatMap(([, voters]) => voters),
                        ...meeting.skipVotes,
                        ...meeting.noVotes,
                        ...(meeting.blackmailedPlayers ?? []),
                        ...(meeting.jailedPlayers ?? []),
                    ]);
                    const playersWithoutVotes = Array.from(participants)
                        .filter(name => !Object.hasOwn(meeting.votes, name) || meeting.votes[name].length === 0)
                        .sort((a, b) => a.localeCompare(b, 'pl'));
                    const outcome = meeting.exiledPlayer ? `Wyrzucono: ${meeting.exiledPlayer}`
                        : meeting.wasTie ? 'Remis' : meeting.exiledPlayer === null ? 'Nikogo nie wyrzucono' : 'Wynik nie został zapisany';
                    const groups = [
                        ...targets.filter(([, voters]) => voters.length > 0).map(([name, voters]) => ({ name, voters })),
                        ...playersWithoutVotes.map(name => ({ name, voters: [] as string[] })),
                    ];
                    function MeetingPlayer({ name, compact = false, count = 1, avatarOnly = false, suppressBlackmailOverlay = false }: { name: string; compact?: boolean; count?: number; avatarOnly?: boolean; suppressBlackmailOverlay?: boolean }) {
                        return <Player name={name} compact={compact} avatarOnly={avatarOnly} count={count} suppressBlackmailOverlay={suppressBlackmailOverlay} player={playersByName.get(name)} seasonId={seasonId}
                            blackmailed={meeting.blackmailedPlayers?.includes(name)} jailed={meeting.jailedPlayers?.includes(name)} />;
                    }
                    return (
                        <article key={meeting.meetingNumber} className="rounded-xl border border-gray-700/60 bg-gray-800/40">
                            <header className="flex flex-wrap items-center justify-between gap-3 rounded-t-xl border-b border-white/10 bg-black/20 p-5">
                                <div>
                                    <h3 className="font-brook text-2xl text-blue-300">Spotkanie #{meeting.meetingNumber}</h3>
                                    <p className="mt-1 text-sm text-gray-400">Głosujących: {votersCount} · Zapisanych głosów: {totalVotes} · Bez głosu: {new Set(meeting.noVotes).size}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(meeting.exiledPlayer !== undefined || meeting.wasTie) && (
                                        <span className={`rounded-lg border px-3 py-2 text-sm ${meeting.exiledPlayer ? 'border-red-400/30 bg-red-500/10 text-red-300' : 'border-yellow-400/30 bg-yellow-500/10 text-yellow-200'}`}>{outcome}</span>
                                    )}
                                    {meeting.wasTie && meeting.exiledPlayer && <span className="rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-200">Remis</span>}
                                    {meeting.wasBlessed && <span className="rounded-lg bg-purple-500/10 px-3 py-2 text-purple-300">Błogosławione spotkanie</span>}
                                </div>
                            </header>
                            <div className="space-y-6 p-5">
                                    <div>
                                        <h4 className="mb-2 font-semibold text-red-300">Zgony od poprzedniego spotkania</h4>
                                        {meeting.deathsSinceLastMeeting.length ? (
                                            <ul className="flex flex-wrap items-start gap-3 rounded-lg border border-red-400/30 bg-red-500/5 p-3 text-sm text-gray-300">
                                                {meeting.deathsSinceLastMeeting.map((death, index) => {
                                                    const playerName = death.split(' (')[0].trim();

                    return (
                                                        <li key={index} className="flex items-center gap-3">
                                                            <div className="min-w-0">
                                                                <MeetingPlayer compact name={playerName} />
                                                                {death.slice(playerName.length).trim() && <p className="mt-2 break-words text-xs text-gray-400">{death.slice(playerName.length).trim()}</p>}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        ) : <p className="text-sm text-gray-400">Brak zapisanych zgonów.</p>}
                                    </div>

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-200">Rozkład głosów</h4>
                                    {groups.length === 0 && <p className="text-sm text-gray-400">Brak zapisanych głosów.</p>}
                                    <div className="grid grid-cols-1 items-stretch gap-3 md:grid-cols-2 xl:grid-cols-3">
                                    {groups.map(group => {
                                        const counts = new Map<string, number>();
                                        group.voters.forEach(name => counts.set(name, (counts.get(name) ?? 0) + 1));

                    return (
                                            <div key={group.name} className="relative rounded-lg border border-white/10 bg-black/20 p-3">
                                                <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                                                    <MeetingPlayer suppressBlackmailOverlay name={group.name} />
                                                    <span className="shrink-0 text-sm text-gray-300">Głosy: <strong className="text-white">{group.voters.length}</strong></span>
                                                </div>
                                                {meeting.deathsDuringMeeting?.includes(group.name) && <p className="mb-2 text-xs font-semibold text-red-300">Zginął na spotkaniu</p>}
                                                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
                                                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${totalVotes ? group.voters.length / totalVotes * 100 : 0}%` }} />
                                                </div>
                                                <p className="mb-2 text-xs text-gray-400">{group.voters.length ? 'Głosowali:' : 'Nikt nie oddał głosu na tego gracza.'}</p>
                                                <div className="flex flex-wrap gap-2">{Array.from(counts, ([name, count]) => <MeetingPlayer compact avatarOnly key={name} name={name} count={count} />)}</div>
                                                {meeting.blackmailedPlayers?.includes(group.name) && <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 rounded-lg bg-red-500/20" />}
                                            </div>
                                        );
                                    })}
                                    </div>
                                    {targets.some(([, voters]) => new Set(voters).size < voters.length) && <p className="text-xs text-gray-400">× oznacza kilka zapisanych głosów tej samej osoby na dany cel. Rozkład pokazuje zapisane głosy; wynik uwzględnia również działanie zdolności.</p>}
                                </div>
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h4 className="font-semibold text-yellow-300">Pominięcia</h4>
                                            <span className="text-sm text-gray-300">Głosy: <strong className="text-white">{meeting.skipVotes.length}</strong></span>
                                        </div>
                                        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
                                            <div className="h-full rounded-full bg-yellow-400" style={{ width: `${totalVotes ? meeting.skipVotes.length / totalVotes * 100 : 0}%` }} />
                                        </div>
                                        {meeting.skipVotes.length ? <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(meeting.skipVotes), name => <MeetingPlayer compact avatarOnly key={name} name={name} />)}
                                        </div> : <p className="text-xs text-gray-400">Nikt nie zagłosował na pominięcie.</p>}
                                    </div>
                                    <div className="rounded-lg border border-white/20 bg-white/10 p-3">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h4 className="font-semibold text-gray-200">Nie oddali głosu</h4>
                                            <span className="text-sm text-gray-300">Gracze: <strong className="text-white">{new Set(meeting.noVotes).size}</strong></span>
                                        </div>
                                        {meeting.noVotes.length ? (
                                        <div className="flex flex-wrap gap-2">
                                            {Array.from(new Set(meeting.noVotes), name => <MeetingPlayer compact key={name} name={name} />)}
                                        </div>
                                        ) : <p className="text-xs text-gray-300">{totalVotes === 0 ? 'Nie zapisano głosowania na tym spotkaniu.' : 'Wszyscy zapisani uczestnicy oddali głos.'}</p>}
                                    </div>
                                </div>

                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
