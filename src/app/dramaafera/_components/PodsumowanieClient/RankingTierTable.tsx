import type { PlayerRankingAfterSession, WeeklyPlayerStats } from './types';
import { RANK_TIERS } from '../../_constants/rankTiers';

interface RankingTierTableProps {
    isFullscreen: boolean;
    rankingAfterSession: PlayerRankingAfterSession[];
    weeklyStats: Pick<WeeklyPlayerStats, 'nickname' | 'totalPoints'>[];
    animate?: boolean;
    title?: string;
}

function getTierRange(tier: typeof RANK_TIERS[number], index: number): string {
    if (index === 0) return `${tier.minRating}+`;
    if (index === RANK_TIERS.length - 1) return `<${RANK_TIERS[index - 1].minRating}`;
    return `${tier.minRating}-${RANK_TIERS[index - 1].minRating}`;
}

function getRankTier(rating: number) {
    const index = RANK_TIERS.findIndex(t => rating >= t.minRating);
    const tier = index !== -1 ? RANK_TIERS[index] : RANK_TIERS[RANK_TIERS.length - 1];
    const tierIndex = index !== -1 ? index : RANK_TIERS.length - 1;
    return { name: tier.name, color: tier.color, range: getTierRange(tier, tierIndex) };
}

export default function RankingTierTable({ isFullscreen, rankingAfterSession, weeklyStats, animate = false, title }: RankingTierTableProps) {
    const allPlayers = rankingAfterSession;

    // Definicja wszystkich tierów w kolejności (derived from RANK_TIERS)
    const allTiers = RANK_TIERS.map((tier, index) => ({
        ...tier,
        range: getTierRange(tier, index),
    }));

    // Grupuj graczy po tierach
    const tierGroups = new Map<string, PlayerRankingAfterSession[]>();

    // Inicjalizuj wszystkie tiery pustymi tablicami
    allTiers.forEach(tier => {
        const tierKey = `${tier.name}|${tier.color}|${tier.range}`;
        tierGroups.set(tierKey, []);
    });

    // Przypisz graczy do tierów
    allPlayers.forEach(player => {
        const tier = getRankTier(Math.round(player.rating));
        const tierKey = `${tier.name}|${tier.color}|${tier.range}`;
        tierGroups.get(tierKey)!.push(player);
    });

    // Emperor - gracz z największą liczbą DAP w tym tygodniu
    let emperor: PlayerRankingAfterSession | undefined;
    if (weeklyStats.length > 0) {
        // Znajdź gracza z największym totalPoints
        const topDapPlayer = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints)[0];
        // Znajdź jego dane w rankingAfterSession
        emperor = allPlayers.find(p => p.nickname === topDapPlayer.nickname);
    }

    return (
        <table className={title ? 'w-full border-collapse' : 'border-collapse'} style={{ border: '3px solid rgb(251, 191, 36)' }}>
            <thead>
                <tr style={{ backgroundColor: 'rgba(217, 119, 6, 0.3)', borderBottom: '3px solid rgb(251, 191, 36)' }}>
                    {title ? (
                        <th colSpan={3} className="whitespace-nowrap px-4 py-3 text-center text-3xl font-bold text-amber-300">
                            {title}
                        </th>
                    ) : (
                        <>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '3px solid rgb(251, 191, 36)', width: '1%', whiteSpace: 'nowrap' }}>
                                #
                            </th>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '3px solid rgb(251, 191, 36)', width: '1%', whiteSpace: 'nowrap' }}>
                                TIER
                            </th>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
                                GRACZE
                            </th>
                        </>
                    )}
                </tr>
            </thead>
            <tbody>
                {(() => {
                    let rowIndex = 0;
                    return (
                        <>
                            {/* Emperor row */}
                            {emperor && (
                                <tr
                                    className={animate ? 'animate-[fadeIn_0.3s_ease-in]' : undefined}
                                    style={{
                                        backgroundColor: 'rgb(239, 68, 68)',
                                        animationDelay: `${rowIndex++ * 0.05}s`,
                                        borderBottom: '2px dotted rgba(200, 200, 200, 0.5)'
                                    }}
                                >
                                    <td className={`py-3 px-4 text-center text-white font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '2px dotted rgba(200, 200, 200, 0.5)', width: '1%', whiteSpace: 'nowrap' }}>
                                        👑
                                    </td>
                                    <td className={`py-3 px-4 text-center text-white font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '2px dotted rgba(200, 200, 200, 0.5)', width: '1%', whiteSpace: 'nowrap' }}>
                                        THE EMPEROR
                                    </td>
                                    <td className={`py-3 px-4 text-center text-white font-bold ${isFullscreen ? 'text-3xl' : 'text-lg'}`}>
                                        {emperor.nickname}
                                    </td>
                                </tr>
                            )}

                            {/* Tier rows */}
                            {Array.from(tierGroups.entries()).map(([tierKey, players]) => {
                                const [tierName, tierColor, tierRange] = tierKey.split('|');
                                // Czarny tekst dla MASTER i GRANDMASTER, biały dla pozostałych
                                const textColor = (tierName === 'MASTER' || tierName === 'GRANDMASTER') ? 'text-black' : 'text-white';

                                return (
                                    <tr
                                        key={tierKey}
                                        className={animate ? 'animate-[fadeIn_0.3s_ease-in]' : undefined}
                                        style={{
                                            backgroundColor: tierColor,
                                            animationDelay: `${rowIndex++ * 0.05}s`,
                                            borderBottom: '2px dotted rgba(200, 200, 200, 0.5)'
                                        }}
                                    >
                                        <td className={`py-3 px-4 text-center ${textColor} font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '2px dotted rgba(200, 200, 200, 0.5)', width: '1%', whiteSpace: 'nowrap' }}>
                                            {tierRange}
                                        </td>
                                        <td className={`py-3 px-4 text-center ${textColor} ${isFullscreen ? 'text-xl' : 'text-lg'}`} style={{ whiteSpace: 'nowrap', borderRight: '2px dotted rgba(200, 200, 200, 0.5)', width: '1%' }}>
                                            {tierName}
                                        </td>
                                        <td className={`py-3 px-4 text-center ${textColor} ${isFullscreen ? 'text-lg' : 'text-base'}`}>
                                            {players.length > 0 ? (
                                                players.map((player, idx) => (
                                                    <span key={player.nickname}>
                                                        {idx > 0 && ', '}
                                                        {player.nickname}&nbsp;
                                                        <span
                                                            style={{
                                                                color: player.ratingChange > 0 ? '#22c55e' : player.ratingChange < 0 ? '#ef4444' : 'inherit'
                                                            }}
                                                        >
                                                            ({Math.round(player.rating)})
                                                        </span>
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-gray-500 italic">—</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </>
                    );
                })()}
            </tbody>
        </table>
    );
}
