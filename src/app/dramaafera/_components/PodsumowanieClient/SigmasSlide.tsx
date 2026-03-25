import Image from 'next/image';
import { SigmaPlayer, WeeklyPlayerStats, RankingHistoryPoint } from './types';
import { UIGameData } from '@/app/dramaafera/_services/games/types';
import { getRankName, videotext } from './constants';
import PlayerHistory from './PlayerHistory';
import { RankingChart } from './RankingChart';

interface SigmasSlideProps {
    isFullscreen: boolean;
    currentStep: number;
    isTransitioning: boolean;
    topSigmas: SigmaPlayer[];
    weeklyStats: WeeklyPlayerStats[];
    sigmaRankingHistory: Map<string, RankingHistoryPoint[]>;
    topPlayerGames: UIGameData[];
    playerRankingChanges: Map<string, number>;
    date: string;
}

export default function SigmasSlide({
    isFullscreen,
    currentStep,
    isTransitioning,
    topSigmas,
    weeklyStats,
    sigmaRankingHistory,
    topPlayerGames,
    playerRankingChanges,
    date,
}: SigmasSlideProps) {
    if (topSigmas.length < 3) return null;

    // Sortuj według punktów DAP żeby mieć TOP 3 (do sprawdzenia czy sigma była w top 3)
    const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
    const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);

    // Krok 0: Tytuł
    if (currentStep === 0) {
        return (
            <div 
                className="relative w-full h-full flex items-center justify-center"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.5s ease-out'
                }}
            >
                <h1 
                    className={`font-bold text-amber-400 text-center ${isFullscreen ? 'text-7xl' : 'text-5xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(251, 191, 36, 0.7)'      
                    }}
                >
                    NAJWIĘKSZE SIGMY<br />TYGODNIA
                </h1>
            </div>
        );
    }

    // Kroki 1-3: Pokazywanie sigm (3. -> 2. -> 1.)
    // Krok 4: Historia TOP 1 (jeśli nie był w top 3)
    const top1Sigma = topSigmas[0];
    const top1WasInTop3 = top3Nicknames.includes(top1Sigma.nickname);

    // Krok 4: Historia TOP 1 (tylko jeśli nie był w top 3)
    if (currentStep === 4) {
        if (!top1WasInTop3 && topPlayerGames.length > 0) {
            return <PlayerHistory nickname={top1Sigma.nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />;
        }
        // Jeśli był w top 3, ten krok nie istnieje (slides.steps = 4 zamiast 5)
        return null;
    }

    // Kroki 1-3: Normalne wyświetlanie sigm
    const sigmaIndex = 3 - currentStep; // 2, 1, 0 dla kroków 1, 2, 3
    const sigma = topSigmas[sigmaIndex];
    const rankingHistory = sigmaRankingHistory.get(sigma.nickname) || [];

    // Normalny widok sigmy
    return (
        <div 
            className="relative w-full h-full flex items-center justify-center px-8"
            style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            <div className="w-full max-w-7xl flex gap-8 items-center">
                {/* Lewa strona - Avatar i statystyki */}
                <div className="flex-shrink-0" style={{ width: isFullscreen ? '400px' : '300px' }}>
                    <div className="text-center">
                        {/* Pozycja */}
                        <div 
                            className={`font-bold mb-4 ${isFullscreen ? 'text-5xl' : 'text-3xl'}`}
                            style={{ color: 'rgba(245, 216, 122, 1)' }}
                        >
                            #{sigmaIndex + 1} SIGMA
                        </div>

                        {/* Avatar */}
                        <div 
                            className="relative mx-auto overflow-hidden mb-6"
                            style={{ 
                                width: isFullscreen ? '300px' : '200px', 
                                height: isFullscreen ? '300px' : '200px',
                                border: '6px solid rgba(245, 216, 122, 1)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                            }}
                        >
                            <Image
                                src={`/images/avatars/${sigma.nickname}.png`}
                                alt={sigma.nickname}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/images/avatars/placeholder.png';
                                }}
                            />
                            {/* Overlay z cieniem wewnętrznym */}
                            <div 
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                }}
                            />
                        </div>

                        {/* Nick */}
                        <div className={`font-bold text-white mb-2 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                            {sigma.nickname}
                        </div>

                        {/* Ranga */}
                        <div 
                            className={`${videotext.className} font-semibold mb-6 ${isFullscreen ? 'text-3xl' : 'text-sm'}`}
                            style={{ color: 'rgba(245, 216, 122, 1)' }}
                        >
                            {getRankName(sigma.ratingAfter)}
                        </div>

                        {/* Statystyki wzrostu */}
                        <div className={`text-amber-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                            <div className="mb-3">
                                <div className="text-gray-400 text-sm mb-1">Pozycja w rankingu</div>
                                {sigma.rankBefore === sigma.rankAfter ? (
                                    <span className={`${videotext.className} text-4xl font-bold` } style={{ color: 'rgb(255, 255, 255)' }}>#{sigma.rankAfter}</span>
                                ) : (
                                    <>
                                        <span className={`${videotext.className} text-4xl text-white`}>#{sigma.rankBefore}</span> 
                                        <span className="text-4xl text-white mx-2">→</span> 
                                        <span className={`${videotext.className} text-4xl text-green-500`} style={{ textShadow: '0 0 60px rgba(34, 197, 94, 0.9), 0 0 40px rgba(34, 197, 94, 0.7), 0 0 20px rgba(34, 197, 94, 0.5)' }}>#{sigma.rankAfter}</span>
                                    </>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Rating</div>
                                <span className={`${videotext.className} text-4xl text-white`}>{Math.round(sigma.ratingBefore)}</span> 
                                <span className="text-4xl text-white mx-2">→</span> 
                                <span className={`${videotext.className} text-4xl text-green-400`} style={{ textShadow: '0 0 60px rgba(74, 222, 128, 0.9), 0 0 40px rgba(74, 222, 128, 0.7), 0 0 20px rgba(74, 222, 128, 0.5)' }}>{Math.round(sigma.ratingAfter)}</span>
                                <div className={`${videotext.className} text-2xl text-white mt-0`}>
                                    +{Math.round(sigma.ratingAfter) - Math.round(sigma.ratingBefore)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prawa strona - Wykres */}
                <div className="flex-grow">
                    <h2 
                        className={`font-bold text-center mb-6 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}
                        style={{ color: 'rgba(245, 216, 122, 1)' }}
                    >
                        Historia Rankingu
                    </h2>
                    
                    {rankingHistory.length > 0 ? (
                        <div className="bg-zinc-900/80 rounded-lg p-6">
                            <RankingChart data={rankingHistory} isFullscreen={isFullscreen} weekDate={date} variant="sigma" />
                        </div>
                    ) : (
                        <div className={`text-center text-amber-300 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
                            Brak danych historycznych
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
