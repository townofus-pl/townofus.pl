import Image from 'next/image';
import { SigmaPlayer, WeeklyPlayerStats, RankingHistoryPoint } from './types';
import { UIGameData } from '@/app/dramaafera/_services/games/types';
import { getRankName, videotext } from './constants';
import PlayerHistory from './PlayerHistory';
import { RankingChart } from './RankingChart';

interface CweleSlideProps {
    isFullscreen: boolean;
    currentStep: number;
    isTransitioning: boolean;
    topCwele: SigmaPlayer[];
    weeklyStats: WeeklyPlayerStats[];
    cwelRankingHistory: Map<string, RankingHistoryPoint[]>;
    topPlayerGames: UIGameData[];
    playerRankingChanges: Map<string, number>;
    date: string;
}

export default function CweleSlide({ isFullscreen, currentStep, isTransitioning, topCwele, weeklyStats, cwelRankingHistory, topPlayerGames, playerRankingChanges, date }: CweleSlideProps) {
    if (topCwele.length < 3) return null;

    // Sortuj według punktów DAP żeby mieć TOP 3 (do sprawdzenia czy cwel był w top 3)
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
                    className={`font-bold text-red-600 text-center ${isFullscreen ? 'text-7xl' : 'text-5xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(161, 8, 8, 0.7)'
                    }}
                >
                    NAJWIĘKSZE CWELE<br />TYGODNIA
                </h1>
            </div>
        );
    }

    // Kroki 1-3: Pokazywanie cweli (3. -> 2. -> 1.)
    // Krok 4: Historia TOP 1 (jeśli nie był w top 3)
    const top1Cwel = topCwele[0];
    const top1WasInTop3 = top3Nicknames.includes(top1Cwel.nickname);

    // Krok 4: Historia TOP 1 (tylko jeśli nie był w top 3)
    if (currentStep === 4) {
        if (!top1WasInTop3 && topPlayerGames.length > 0) {
            return <PlayerHistory nickname={top1Cwel.nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />;
        }
        // Jeśli był w top 3, ten krok nie istnieje (slides.steps = 4 zamiast 5)
        return null;
    }

    // Kroki 1-3: Normalne wyświetlanie cweli
    const cwelIndex = 3 - currentStep; // 2, 1, 0 dla kroków 1, 2, 3
    const cwel = topCwele[cwelIndex];
    const rankingHistory = cwelRankingHistory.get(cwel.nickname) || [];

    // Normalny widok cwela
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
                            style={{ color: 'rgb(202, 15, 15)' }}
                        >
                            #{cwelIndex + 1} CWEL
                        </div>

                        {/* Avatar */}
                        <div 
                            className="relative mx-auto overflow-hidden mb-6"
                            style={{ 
                                width: isFullscreen ? '300px' : '200px', 
                                height: isFullscreen ? '300px' : '200px',
                                border: '6px solid rgb(162, 17, 17)',
                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                            }}
                        >
                            <Image
                                src={`/images/avatars/${cwel.nickname}.png`}
                                alt={cwel.nickname}
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
                                    boxShadow: 'inset 0 0 60px rgba(105, 13, 13, 0.5), inset 0 0 25px rgba(182, 41, 41, 0.3)'
                                }}
                            />
                        </div>

                        {/* Nick */}
                        <div className={`font-bold text-white mb-2 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                            {cwel.nickname}
                        </div>

                        {/* Ranga */}
                        <div 
                            className={`${videotext.className} font-semibold mb-6 ${isFullscreen ? 'text-3xl' : 'text-sm'}`}
                            style={{ color: 'rgb(202, 15, 15)' }}
                        >
                            {getRankName(cwel.ratingAfter)}
                        </div>

                        {/* Statystyki spadku */}
                        <div className={`text-red-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                            <div className="mb-3">
                                <div className="text-gray-400 text-sm mb-1">Pozycja w rankingu</div>
                                {cwel.rankBefore === cwel.rankAfter ? (
                                    <span className={`font-bold text-4xl ${videotext.className}`}  style={{ color: 'rgb(255, 255, 255)' }}>#{cwel.rankAfter}</span>
                                ) : (
                                    <>
                                        <span className={`${videotext.className} text-4xl text-white`}>#{cwel.rankBefore}</span> 
                                        <span className="mx-2 text-4xl text-white">→</span> 
                                        <span className={`${videotext.className} text-4xl`} style={{ color: 'rgb(202, 15, 15)', textShadow: '0 0 60px rgba(160, 10, 10, 0.9), 0 0 40px rgba(209, 10, 10, 0.7), 0 0 20px rgba(238, 18, 18, 0.5)' }}>#{cwel.rankAfter}</span>
                                    </>
                                )}
                            </div>
                            <div>
                                <div className="text-gray-400 text-sm mb-1">Rating</div>
                                <span className={`${videotext.className} text-4xl text-white`}>{Math.round(cwel.ratingBefore)}</span> 
                                <span className="mx-2 text-4xl text-white">→</span> 
                                <span className={`${videotext.className} text-4xl`} style={{ color: 'rgb(202, 15, 15)', textShadow: '0 0 60px rgba(160, 10, 10, 0.9), 0 0 40px rgba(209, 10, 10, 0.7), 0 0 20px rgba(238, 18, 18, 0.5)' }}>{Math.round(cwel.ratingAfter)}</span>
                                <div className={`${videotext.className} mt-1 text-2xl`} style={{ color: 'rgb(255, 255, 255)' }}>
                                    {Math.round(cwel.ratingAfter) - Math.round(cwel.ratingBefore)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Prawa strona - Wykres */}
                <div className="flex-grow">
                    <h2 
                        className={`font-bold text-center mb-6 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}
                        style={{ color: 'rgb(162, 17, 17)' }}
                    >
                        Historia Rankingu
                    </h2>
                    
                    {rankingHistory.length > 0 ? (
                        <div className="bg-zinc-900/80 rounded-lg p-6">
                            <RankingChart data={rankingHistory} isFullscreen={isFullscreen} weekDate={date} variant="cwel" />
                        </div>
                    ) : (
                        <div className={`text-center text-red-300 ${isFullscreen ? 'text-xl' : 'text-lg'}`}>
                            Brak danych historycznych
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
