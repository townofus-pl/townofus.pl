import Image from 'next/image';
import { EmperorHistoryEntry } from './types';
import { videotext } from './constants';
import { AvatarImageFill } from './AvatarImage';

interface EmperorHistorySlideProps {
    isFullscreen: boolean;
    currentStep: number;
    isTransitioning: boolean;
    emperorHistory: EmperorHistoryEntry[];
}

export default function EmperorHistorySlide({ isFullscreen, currentStep, isTransitioning, emperorHistory }: EmperorHistorySlideProps) {
    if (emperorHistory.length === 0) return null;

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
                    className={`${videotext.className} font-bold text-red-400 text-center ${isFullscreen ? 'text-9xl' : 'text-5xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(239, 68, 68, 0.7)'
                    }}
                >
                    LISTA DE<br />EMPERADORES
                </h1>
            </div>
        );
    }

    // Krok 1: Pokazanie całej listy
    return (
        <div 
            className="relative w-full h-full flex flex-col items-center justify-center px-8"
            style={{
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.5s ease-out'
            }}
        >
            {/* Tytuł na górze */}
            <h1 
                className={`${videotext.className} font-bold text-red-400 mb-6 ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}
                style={{
                    textShadow: '0 0 40px rgba(239, 68, 68, 0.7)'
                }}
            >
                LISTA DE EMPERADORES
            </h1>

            {/* Lista emperorów */}
            <div 
                className="w-full max-w-4xl flex flex-col"
                style={{ 
                    gap: emperorHistory.length > 9 ? '0.3rem' : emperorHistory.length > 8 ? '0.75rem' : emperorHistory.length > 7 ? '0.75rem' : '1rem',
                }}
            >
                {[...emperorHistory]
                    .sort((a, b) => {
                        // Najpierw sortuj według liczby gwiazdek (malejąco)
                        if (a.count !== b.count) {
                            return b.count - a.count;
                        }
                        // Jeśli ta sama liczba gwiazdek, sortuj według najnowszej daty (malejąco - świeżsi wyżej)
                        const aLatestDate = a.dates[a.dates.length - 1];
                        const bLatestDate = b.dates[b.dates.length - 1];
                        return bLatestDate.localeCompare(aLatestDate);
                    })
                    .map((emperor) => {
                    const scaleFactor = emperorHistory.length > 9 ? 0.7 : emperorHistory.length > 7 ? 0.75 : emperorHistory.length > 6 ? 0.85 : emperorHistory.length > 3 ? 1 : 1.3;
                    const avatarSize = isFullscreen ? 100 * scaleFactor : 80 * scaleFactor;
                    const fontSize = emperorHistory.length > 6
                        ? (isFullscreen ? 'text-3xl' : 'text-xl')
                        : emperorHistory.length > 4 
                        ? (isFullscreen ? 'text-4xl' : 'text-2xl')
                        : (isFullscreen ? 'text-5xl' : 'text-3xl');
                    
                    return (
                        <div
                            key={emperor.nickname}
                            className="flex items-center"
                            style={{ padding: emperorHistory.length > 6 ? '0.5rem' : emperorHistory.length > 4 ? '1rem' : '1.5rem' }}
                        >
                            {/* Avatar */}
                            <div 
                                className="relative overflow-hidden mr-6 flex-shrink-0"
                                style={{ 
                                    width: `${avatarSize}px`, 
                                    height: `${avatarSize}px`,
                                    border: '3px solid rgba(245, 216, 122, 1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.6)'
                                }}
                            >
                                <AvatarImageFill nickname={emperor.nickname} />
                                {/* Warstwa wewnętrznego cienia */}
                                <div 
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        boxShadow: 'inset 0 0 20px rgba(197, 176, 98, 0.3), inset 0 0 10px rgba(207, 178, 72, 0.2)'
                                    }}
                                />
                            </div>

                            {/* Nick */}
                            <div className={`${videotext.className} font-bold text-white uppercase ${fontSize} flex-grow flex items-center`}>
                                {emperor.nickname}
                            </div>

                            {/* Gwiazdki */}
                            <div className="flex gap-2 items-center flex-shrink-0">
                                {Array.from({ length: emperor.count }).map((_, starIndex) => {
                                    // Ostatnia gwiazdka jest "nowa" jeśli to najnowszy emperor
                                    const isNewStar = emperor.isLatest && starIndex === emperor.count - 1;
                                    
                                    return (
                                        <div
                                            key={starIndex}
                                            className="transition-all duration-300"
                                            style={{
                                                filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.8))',
                                                animation: isNewStar ? 'pulseShadow 1s ease-in-out infinite' : 'none'
                                            }}
                                        >
                                            <Image
                                                src="/images/star.svg"
                                                alt="Emperor star"
                                                width={40}
                                                height={40}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })
                }
            </div>
        </div>
    );
}
