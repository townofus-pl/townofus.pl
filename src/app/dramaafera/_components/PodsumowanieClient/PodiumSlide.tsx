import Image from 'next/image';
import { WeeklyPlayerStats } from './types';
import { UIGameData } from '@/app/dramaafera/_services/games/types';
import { videotext, PODIUM_STANDARD_STEPS, PODIUM_TIE_STEPS } from './constants';
import PlayerHistory from './PlayerHistory';
import { AvatarImageFill } from './AvatarImage';

interface PodiumSlideProps {
    isFullscreen: boolean;
    weeklyStats: WeeklyPlayerStats[];
    topPlayerGames: UIGameData[];
    playerRankingChanges: Record<string, number>;
    date: string;
    currentStep: number;
}

export default function PodiumSlide({
    isFullscreen,
    weeklyStats,
    topPlayerGames,
    playerRankingChanges,
    date,
    currentStep,
}: PodiumSlideProps) {
    // Sortuj według punktów DAP (malejąco) żeby mieć prawidłową TOP 3
    const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Sprawdź czy jest remis na 3. miejscu
    const hasThirdPlaceTie = sortedStats.length >= 4 && 
        sortedStats[2].totalPoints === sortedStats[3].totalPoints;
    
    // Określenie opacity podium na podstawie kroku (overlay histori gier)
    // Przy remisie: krok 2=historia 1. z remisu, 3=historia 2. z remisu, 6=historia 2., 9=historia 1.
    // Normalnie: krok 2=historia 3., 5=historia 2., 8=historia 1.
    const showHistorySteps: number[] = hasThirdPlaceTie 
        ? [PODIUM_TIE_STEPS.tiedThirdPlaceHistory1, PODIUM_TIE_STEPS.tiedThirdPlaceHistory2, PODIUM_TIE_STEPS.secondPlaceHistory, PODIUM_TIE_STEPS.firstPlaceHistory]
        : [PODIUM_STANDARD_STEPS.thirdPlaceHistory, PODIUM_STANDARD_STEPS.secondPlaceHistory, PODIUM_STANDARD_STEPS.firstPlaceHistory];
    const podiumOpacity = showHistorySteps.includes(currentStep) ? 0 : 1;
    const secondPlaceStyle = {
        left: isFullscreen ? '13.5%' : '12%',
        top: isFullscreen ? '24%' : '8%',
        width: isFullscreen ? '260px' : '150px',
        height: isFullscreen ? '260px' : '150px'
    };
    const firstPlaceStyle = {
        left: isFullscreen ? '36.7%' : '42%',
        top: isFullscreen ? '-10%' : '2%',
        width: isFullscreen ? '370px' : '105px',
        height: isFullscreen ? '370px' : '105px'
    };
    const showActualSecondPlace = hasThirdPlaceTie
        ? currentStep >= PODIUM_TIE_STEPS.secondPlaceReveal
        : currentStep >= PODIUM_STANDARD_STEPS.secondPlaceReveal;
    const showActualFirstPlace = hasThirdPlaceTie
        ? currentStep >= PODIUM_TIE_STEPS.firstPlaceReveal
        : currentStep >= PODIUM_STANDARD_STEPS.firstPlaceReveal;
    
    return (
        <>
            {/* Główne podium - używa grafiki podium.png */}
            <div 
                className="absolute left-0 right-0 flex justify-center z-10" 
                style={{ 
                    bottom: 0, 
                    margin: 0, 
                    padding: 0, 
                    lineHeight: 0,
                    opacity: podiumOpacity
                }}
            >
                <div className="relative" style={{ margin: 0, padding: 0, display: 'block', lineHeight: 0 }}>
                    {/* Grafika podium */}
                    <Image
                        src="/images/podium.png"
                        alt="Podium"
                        width={isFullscreen ? 1400 : 600}
                        height={isFullscreen ? 450 : 350}
                        className="z-0"
                        style={{ display: 'block', margin: 0, padding: 0, verticalAlign: 'bottom' }}
                    />
                    
                    {/* 3. miejsce - prawa pozycja - pokazuje się w kroku 1 */}
                    {hasThirdPlaceTie && sortedStats[3] ? (
                        // REMIS - dwa osobne kwadraty jeden nad drugim ze wspólnym napisem
                        <>
                            {/* Wspólny napis nad oboma kafelkami */}
                            {currentStep >= 1 && (
                                <div 
                                    className="absolute text-center"
                                    style={{ 
                                        right: isFullscreen ? '13.5%' : '12%',
                                        top: isFullscreen ? '-15%' : '3%',
                                        width: isFullscreen ? '260px' : '80px',
                                        opacity: 0,
                                        animation: 'fadeIn 1s ease-out 0.5s forwards'
                                    }}
                                >
                                    <div 
                                        className={`${videotext.className} font-bold text-amber-400 ${isFullscreen ? 'text-2xl' : 'text-base'}`}
                                        style={{ textTransform: 'uppercase' }}
                                    >
                                        {sortedStats[2].nickname} & {sortedStats[3].nickname}
                                    </div>
                                    <div className={`${videotext.className} font-bold text-amber-300 ${isFullscreen ? 'text-xl' : 'text-sm'}`}>
                                        {sortedStats[2].totalPoints} DAP
                                    </div>
                                </div>
                            )}

                            {/* Pierwszy gracz z remisu - górny kwadrat */}
                            <div className="absolute" style={{ 
                                right: isFullscreen ? '13.5%' : '12%', 
                                top: isFullscreen ? '-5%' : '8%',
                                width: isFullscreen ? '260px' : '80px',
                                height: isFullscreen ? '260px' : '80px'
                            }}>
                                
                                <div 
                                    className={`relative w-full h-full transition-transform duration-1000 ${
                                        currentStep >= 1 ? 'flip-card-flipped' : ''
                                    }`}
                                    style={{ 
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px'
                                    }}
                                >
                                    {/* Tylna strona - znak zapytania */}
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(0deg)',
                                            border: '6px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                            boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                        }}
                                    >
                                        <div className={`${videotext.className} text-white text-9xl font-bold pixelated`}>?</div>
                                    </div>
                                    
                                    {/* Przednia strona - avatar */}
                                    <div 
                                        className="absolute inset-0"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        <div 
                                            className="relative w-full h-full"
                                            style={{
                                                border: '6px solid rgba(245, 216, 122, 1)',
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                            }}
                                        >
                                             <AvatarImageFill nickname={sortedStats[2].nickname} />
                                            <div 
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Drugi gracz z remisu - dolny kwadrat */}
                            <div className="absolute" style={{ 
                                right: isFullscreen ? '13.5%' : '12%', 
                                top: isFullscreen ? '30%' : '35%',
                                width: isFullscreen ? '260px' : '80px',
                                height: isFullscreen ? '260px' : '80px'
                            }}>
                                
                                <div 
                                    className={`relative w-full h-full transition-transform duration-1000 ${
                                        currentStep >= 1 ? 'flip-card-flipped' : ''
                                    }`}
                                    style={{ 
                                        transformStyle: 'preserve-3d',
                                        perspective: '1000px'
                                    }}
                                >
                                    {/* Tylna strona - znak zapytania */}
                                    <div 
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(0deg)',
                                            border: '6px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                            boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                        }}
                                    >
                                        <div className={`${videotext.className} text-white text-9xl font-bold pixelated`}>?</div>
                                    </div>
                                    
                                    {/* Przednia strona - avatar */}
                                    <div 
                                        className="absolute inset-0"
                                        style={{ 
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        <div 
                                            className="relative w-full h-full"
                                            style={{
                                                border: '6px solid rgba(245, 216, 122, 1)',
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                            }}
                                        >
                                             <AvatarImageFill nickname={sortedStats[3].nickname} />
                                            <div 
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        // NORMALNIE - jeden kafelek
                        <div className="absolute" style={{ 
                            right: isFullscreen ? '13.5%' : '12%', 
                            top: isFullscreen ? '30%' : '12%',
                            width: isFullscreen ? '260px' : '80px',
                            height: isFullscreen ? '260px' : '80px'
                        }}>
                            {/* Napisy nad avatarem - pokazują się po odkryciu */}
                            {currentStep >= 1 && sortedStats[2] && (
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 text-center"
                                    style={{ 
                                        bottom: '100%',
                                        marginBottom: isFullscreen ? '20px' : '10px',
                                        width: isFullscreen ? '300px' : '150px',
                                        opacity: 0,
                                        animation: 'fadeIn 1s ease-out 0.5s forwards'
                                    }}
                                >
                                    <div 
                                        className={`${videotext.className} font-bold text-amber-400 ${isFullscreen ? 'text-3xl' : 'text-xl'} mb-1`}
                                        style={{ textTransform: 'uppercase' }}
                                    >
                                        {sortedStats[2].nickname}
                                    </div>
                                    <div className={`${videotext.className} font-bold text-amber-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                        {sortedStats[2].totalPoints} DAP
                                    </div>
                                </div>
                            )}
                        
                        <div 
                            className={`relative w-full h-full transition-transform duration-1000 ${
                                currentStep >= 1 ? 'flip-card-flipped' : ''
                            }`}
                            style={{ 
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}
                        >
                            {/* Tylna strona - znak zapytania */}
                            <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(0deg)',
                                    border: '6px solid rgba(245, 216, 122, 1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                }}
                            >
                                <div className={`${videotext.className} text-white text-9xl font-bold pixelated`}>?</div>
                            </div>
                            
                            {/* Przednia strona - avatar gracza */}
                            <div 
                                className="absolute inset-0"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                {sortedStats[2] && (
                                    <div 
                                        className="relative w-full h-full"
                                        style={{
                                            border: '6px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                        }}
                                    >
                                         <AvatarImageFill nickname={sortedStats[2].nickname} />
                                        {/* Overlay z cieniem wewnętrznym */}
                                        <div 
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    )}

                    {/* 2. miejsce - lewa pozycja */}
                    <div className="absolute" style={secondPlaceStyle}>
                        {/* Napisy nad avatarem - pokazują się po odkryciu */}
                        {showActualSecondPlace && sortedStats[1] && (
                            <div 
                                className="absolute left-1/2 -translate-x-1/2 text-center"
                                style={{ 
                                    bottom: '100%',
                                    marginBottom: isFullscreen ? '20px' : '10px',
                                    width: isFullscreen ? '300px' : '150px',
                                    opacity: 0,
                                    animation: 'fadeIn 1s ease-out 0.5s forwards'
                                }}
                            >
                                <div 
                                    className={`${videotext.className} font-bold text-amber-400 ${isFullscreen ? 'text-3xl' : 'text-xl'} mb-1`}
                                    style={{ textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                                >
                                    {sortedStats[1].nickname}
                                </div>
                                <div className={`${videotext.className} font-bold text-amber-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`} style={{ letterSpacing: '-0.02em' }}>
                                    {sortedStats[1].totalPoints} DAP
                                </div>
                            </div>
                        )}
                        
                        <div 
                            className={`flip-card-container ${
                                showActualSecondPlace ? 'flip-card-flipped' : ''
                            }`}
                        >
                            {/* Tylna strona - znak zapytania */}
                            <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(0deg)',
                                    border: '6px solid rgba(245, 216, 122, 1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                }}
                            >
                                <div className={`${videotext.className} text-white text-9xl font-bold pixelated`}>?</div>
                            </div>
                            
                            {/* Przednia strona - avatar gracza */}
                            <div 
                                className="absolute inset-0"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                {sortedStats[1] && (
                                    <div 
                                        className="relative w-full h-full"
                                        style={{
                                            border: '6px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                        }}
                                    >
                                        <AvatarImageFill nickname={sortedStats[1].nickname} />
                                        {/* Overlay z cieniem wewnętrznym */}
                                        <div 
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 1. miejsce - środkowa pozycja (najwyższa) */}
                    <div className="absolute" style={firstPlaceStyle}>
                        {/* Napisy nad avatarem - EMPEROR, nick, DAP */}
                        {showActualFirstPlace && sortedStats[0] && (
                            <div 
                                className="absolute left-1/2 -translate-x-1/2 text-center"
                                style={{ 
                                    bottom: '100%',
                                    marginBottom: isFullscreen ? '30px' : '15px',
                                    width: isFullscreen ? '700px' : '200px',
                                    opacity: 0,
                                    animation: 'fadeIn 1s ease-out 0.5s forwards'
                                }}
                            >
                                <div 
                                    className={`${videotext.className} font-bold text-red-500 ${isFullscreen ? 'text-7xl' : 'text-4xl'} mb-2 tracking-wider`}
                                    style={{
                                        textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4)',
                                        animation: 'glow 2s ease-in-out infinite alternate',
                                        letterSpacing: '-0.02em'
                                    }}
                                >
                                    THE EMPEROR
                                </div>
                                <div 
                                    className={`${videotext.className} font-bold text-amber-400 ${isFullscreen ? 'text-4xl' : 'text-2xl'} mb-1`}
                                    style={{ textTransform: 'uppercase', letterSpacing: '-0.02em' }}
                                >
                                    {sortedStats[0].nickname}
                                </div>
                                <div className={`${videotext.className} font-bold text-amber-300 ${isFullscreen ? 'text-3xl' : 'text-xl'}`} style={{ letterSpacing: '-0.02em' }}>
                                    {sortedStats[0].totalPoints} DAP
                                </div>
                            </div>
                        )}
                        
                        <div 
                            className={`relative w-full h-full transition-transform duration-1000 ${
                                showActualFirstPlace ? 'flip-card-flipped' : ''
                            }`}
                            style={{ 
                                transformStyle: 'preserve-3d',
                                perspective: '1000px'
                            }}
                        >
                            {/* Tylna strona - znak zapytania */}
                            <div 
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(0deg)',
                                    border: '6px solid rgba(245, 216, 122, 1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                    boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                }}
                            >
                                <div className={`${videotext.className} text-white text-[14rem] font-bold pixelated`}>? </div>
                            </div>
                            
                            {/* Przednia strona - avatar gracza */}
                            <div 
                                className="absolute inset-0"
                                style={{ 
                                    backfaceVisibility: 'hidden',
                                    transform: 'rotateY(180deg)'
                                }}
                            >
                                {sortedStats[0] && (
                                    <div 
                                        className="relative w-full h-full"
                                        style={{
                                            border: '6px solid rgba(245, 216, 122, 1)',
                                            backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                        }}
                                    >
                                        <AvatarImageFill nickname={sortedStats[0].nickname} />
                                        {/* Overlay z cieniem wewnętrznym */}
                                        <div 
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                boxShadow: 'inset 0 0 60px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                            }}
                                        />
                                        {/* Korona */}
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-5xl">
                                            👑
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Overlay z historią gier */}
            {hasThirdPlaceTie ? (
                // Przy remisie: krok 2=historia 1. z remisu, 3=historia 2. z remisu, 6=historia 2., 9=historia 1.
                <>
                    {currentStep === PODIUM_TIE_STEPS.tiedThirdPlaceHistory1 && sortedStats[2] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[2].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                    {currentStep === PODIUM_TIE_STEPS.tiedThirdPlaceHistory2 && sortedStats[3] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[3].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                    {currentStep === PODIUM_TIE_STEPS.secondPlaceHistory && sortedStats[1] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[1].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                    {currentStep === PODIUM_TIE_STEPS.firstPlaceHistory && sortedStats[0] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[0].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                </>
            ) : (
                // Normalnie: krok 2=historia 3., 5=historia 2., 8=historia 1.
                <>
                    {currentStep === PODIUM_STANDARD_STEPS.thirdPlaceHistory && sortedStats[2] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[2].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                    {currentStep === PODIUM_STANDARD_STEPS.secondPlaceHistory && sortedStats[1] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[1].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                    {currentStep === PODIUM_STANDARD_STEPS.firstPlaceHistory && sortedStats[0] && topPlayerGames.length > 0 && <PlayerHistory nickname={sortedStats[0].nickname} isFullscreen={isFullscreen} topPlayerGames={topPlayerGames} playerRankingChanges={playerRankingChanges} date={date} />}
                </>
            )}
        </>
    );
}
