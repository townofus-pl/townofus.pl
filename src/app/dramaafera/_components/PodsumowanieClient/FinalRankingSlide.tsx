import { PlayerRankingAfterSession, WeeklyPlayerStats } from './types';
import { formatDate } from './constants';

interface FinalRankingSlideProps {
    isFullscreen: boolean;
    currentStep: number;
    rankingAfterSession: PlayerRankingAfterSession[];
    weeklyStats: WeeklyPlayerStats[];
    date: string;
}

function getRankTier(rating: number): { name: string; color: string; range: string } {
    if (rating >= 2500) return { name: 'PIERDOLONA LEGENDA', color: 'rgb(114, 5, 14)', range: '2500+' };
    if (rating >= 2400) return { name: 'CELESTIAL OVERLORD', color: 'rgb(147, 112, 219)', range: '2400-2500' };
    if (rating >= 2300) return { name: 'GRANDMASTER', color: 'rgb(255, 215, 0)', range: '2300-2400' };
    if (rating >= 2200) return { name: 'MASTER', color: 'rgb(220, 220, 220)', range: '2200-2300' };
    if (rating >= 2150) return { name: 'VIRTUOSO', color: 'rgb(0, 0, 0)', range: '2150-2200' };
    if (rating >= 2100) return { name: 'THE SPECIALIST', color: 'rgb(0, 0, 0)', range: '2100-2150' };
    if (rating >= 2050) return { name: 'THE CAPTAIN', color: 'rgb(0, 0, 0)', range: '2050-2100' };
    if (rating >= 1975) return { name: 'THE CREWMATE', color: 'rgb(0, 0, 0)', range: '1975-2050' };
    if (rating >= 1875) return { name: 'THE CADET', color: 'rgb(0, 0, 0)', range: '1875-1975' };
    if (rating >= 1750) return { name: 'THE PISSLOW', color: 'rgb(0, 0, 0)', range: '1750-1875' };
    return { name: 'CWEL', color: 'rgb(0, 0, 0)', range: '<1750' };
}

export default function FinalRankingSlide({ isFullscreen, currentStep, rankingAfterSession, weeklyStats, date }: FinalRankingSlideProps) {
    if (rankingAfterSession.length === 0) return null;

    // Krok 0: Tytuł
    if (currentStep === 0) {
        return (
            <div className="relative w-full h-full flex items-center justify-center">
                <h1 
                    className={`font-bold text-amber-400 text-center ${isFullscreen ? 'text-7xl' : 'text-5xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(251, 191, 36, 0.7)'
                    }}
                >
                    AMONG US RANKING AFERA<br />PO {formatDate(date)}
                </h1>
            </div>
        );
    }

    // Krok 1: Pokazywanie całej tabeli (wszyscy gracze)
    const allPlayers = rankingAfterSession;

    // Definicja wszystkich tierów w kolejności
    const allTiers = [
        { name: 'PIERDOLONA LEGENDA', color: 'rgb(114, 5, 14)', range: '2500+', minRating: 2500 },
        { name: 'CELESTIAL OVERLORD', color: 'rgb(147, 112, 219)', range: '2400-2500', minRating: 2400 },
        { name: 'GRANDMASTER', color: 'rgb(255, 215, 0)', range: '2300-2400', minRating: 2300 },
        { name: 'MASTER', color: 'rgb(220, 220, 220)', range: '2200-2300', minRating: 2200 },
        { name: 'VIRTUOSO', color: 'rgb(0, 0, 0)', range: '2150-2200', minRating: 2150 },
        { name: 'THE SPECIALIST', color: 'rgb(0, 0, 0)', range: '2100-2150', minRating: 2100 },
        { name: 'THE CAPTAIN', color: 'rgb(0, 0, 0)', range: '2050-2100', minRating: 2050 },
        { name: 'THE CREWMATE', color: 'rgb(0, 0, 0)', range: '1975-2050', minRating: 1975 },
        { name: 'THE CADET', color: 'rgb(0, 0, 0)', range: '1875-1975', minRating: 1875 },
        { name: 'THE PISSLOW', color: 'rgb(0, 0, 0)', range: '1750-1875', minRating: 1750 },
        { name: 'CWEL', color: 'rgb(0, 0, 0)', range: '<1750', minRating: 0 },
    ];

    // Grupuj graczy po tierach
    const tierGroups = new Map<string, PlayerRankingAfterSession[]>();
    
    // Inicjalizuj wszystkie tiery pustymi tablicami
    allTiers.forEach(tier => {
        const tierKey = `${tier.name}|${tier.color}|${tier.range}`;
        tierGroups.set(tierKey, []);
    });

    // Przypisz graczy do tierów
    allPlayers.forEach(player => {
        const tier = getRankTier(player.rating);
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
        <div className="relative w-full h-full flex flex-col py-6" style={{ overflow: 'hidden' }}>
            {/* Nagłówek */}
            <div 
                className={`text-center mt-10 mb-6 ${isFullscreen ? 'text-6xl' : 'text-5xl'} px-100 font-bold text-amber-400`}
                style={{ textShadow: '0 0 40px rgba(251, 191, 36, 0.9), 0 0 80px rgba(251, 191, 36, 0.6)', whiteSpace: 'nowrap' }}
            >
                AMONG US RANKING AFERA PO {formatDate(date)}
            </div>

            {/* Tabela */}
            <div className="flex-1 px-80 overflow-y-auto flex items-center justify-center">
                <table className="border-collapse" style={{ border: '3px solid rgb(251, 191, 36)' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'rgba(217, 119, 6, 0.3)', borderBottom: '3px solid rgb(251, 191, 36)' }}>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '3px solid rgb(251, 191, 36)', width: '1%', whiteSpace: 'nowrap' }}>
                                #
                            </th>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`} style={{ borderRight: '3px solid rgb(251, 191, 36)', width: '1%', whiteSpace: 'nowrap' }}>
                                TIER
                            </th>
                            <th className={`py-3 px-4 text-amber-300 font-bold ${isFullscreen ? 'text-3xl' : 'text-2xl'}`}>
                                GRACZE
                            </th>
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
                                            className="animate-[fadeIn_0.3s_ease-in]"
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
                                                className="animate-[fadeIn_0.3s_ease-in]"
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
            </div>
        </div>
    );
}
