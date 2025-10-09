"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useParams } from "next/navigation";

// Typy dla danych gracza
interface WeeklyPlayerStats {
    nickname: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    position: number;
    totalPoints: number;
}

interface WeeklyStatsResponse {
    success: boolean;
    data?: {
        date: string;
        weekRange: {
            year: number;
            month: number;
            day: number;
        };
        players: WeeklyPlayerStats[];
        totalPlayers: number;
    };
    error?: string;
}

export default function WeeklySummaryPage() {
    const params = useParams();
    const date = params?.date as string;
    
    const [currentStep, setCurrentStep] = useState(0);
    const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyPlayerStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Funkcja do generowania losowej sekwencji avatarów z warunkiem odległości
    const generateRandomAvatars = (count: number) => {
        const allPlayers = ['ziomson', 'Malkiz', 'nevs', 'smoqu', 'Fearu', 'Budyn', 'Bartek', 'Zieloony', 'Tabakuba', 'silo', 'Quarties', 'Subek', 'Pacia', 'Miras', 'Mamika', 'Jakubeq'];
        const result: string[] = [];
        const recentPlayers: string[] = [];
        const minDistance = 5;

        for (let i = 0; i < count; i++) {
            // Dostępni gracze to wszyscy minus ostatnich 5
            const availablePlayers = allPlayers.filter(player => !recentPlayers.includes(player));
            
            // Jeśli nie ma dostępnych graczy, resetuj listę ostatnich
            const playersToChooseFrom = availablePlayers.length > 0 ? availablePlayers : allPlayers;
            
            // Losuj gracza
            const randomPlayer = playersToChooseFrom[Math.floor(Math.random() * playersToChooseFrom.length)];
            result.push(randomPlayer);
            
            // Dodaj do listy ostatnich
            recentPlayers.push(randomPlayer);
            
            // Zachowaj tylko ostatnich 5
            if (recentPlayers.length > minDistance) {
                recentPlayers.shift();
            }
        }

        return result;
    };

    // Generuj losową sekwencję avatarów - tylko raz przy mount komponenetu
    const [randomAvatars] = useState(() => generateRandomAvatars(96)); // 6 setów po 16 avatarów

    // Pobieranie danych tygodniowych
    useEffect(() => {
        const fetchWeeklyStats = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/dramaafera-new/weekly-stats/${date}`);
                const data: WeeklyStatsResponse = await response.json();
                
                if (data.success && data.data) {
                    setWeeklyStats(data.data.players);
                } else {
                    setError(data.error || 'Nie udało się pobrać danych');
                }
            } catch (err) {
                console.error('Error fetching weekly stats:', err);
                setError('Błąd połączenia z serwerem');
            } finally {
                setLoading(false);
            }
        };

        if (date) {
            fetchWeeklyStats();
        }
    }, [date]);

    // Kroki animacji: 0=intro, 1=tytuł, 2=3.miejsce, 3=2.miejsce, 4=1.miejsce, 5=pozostałe miejsca
    const maxSteps = weeklyStats.length > 0 ? (weeklyStats.length > 3 ? 5 : 4) : 1;

    const handleClick = useCallback(() => {
        if (currentStep < maxSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            // Reset animacji
            setCurrentStep(0);
        }
    }, [currentStep, maxSteps]);

    const togglePresentationFullscreen = () => {
        if (!isPresentationFullscreen) {
            // Wejście w pełny ekran
            document.documentElement.requestFullscreen();
        } else {
            // Wyjście z pełnego ekranu
            document.exitFullscreen();
        }
    };

    // Obsługa zmian stanu pełnego ekranu
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreenNow = !!document.fullscreenElement;
            setIsPresentationFullscreen(isFullscreenNow);
            
            // Dodaj/usuń klasę CSS dla body żeby ukryć inne elementy
            if (isFullscreenNow) {
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
            }
        };

        const handleKeyPress = (event: KeyboardEvent) => {
            // Klawisz Escape automatycznie wyjdzie z pełnego ekranu (obsługa przeglądarki)
            // Dodajemy też spacebar dla wygody
            if (event.key === ' ' && isPresentationFullscreen) {
                event.preventDefault();
                handleClick();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('keydown', handleKeyPress);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('keydown', handleKeyPress);
            // Cleanup - przywróć normalny overflow
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isPresentationFullscreen, handleClick]);

    // Formatowanie daty
    const formatDate = (dateStr: string) => {
        if (dateStr.length !== 8) return dateStr;
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${day}.${month}.${year}`;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-400 mx-auto mb-4"></div>
                    <p className="text-2xl text-amber-200">Ładowanie statystyk tygodniowych...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h1 className="text-4xl font-brook font-bold text-red-400 mb-4">Błąd</h1>
                    <p className="text-xl text-amber-200">{error}</p>
                </div>
            </div>
        );
    }

    // No data state
    if (weeklyStats.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900 text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h1 className="text-4xl font-brook font-bold text-amber-400 mb-4">Brak danych</h1>
                    <p className="text-xl text-amber-200">Nie znaleziono gier w tym tygodniu</p>
                    <p className="text-lg text-amber-300 mt-2">({formatDate(date)})</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Widok startowy - przycisk do uruchomienia prezentacji */}
            {!isPresentationFullscreen && (
                <div className="min-h-screen bg-zinc-800 text-white flex items-center justify-center p-4">
                    <div className="text-center">
                        <h1 className="text-4xl font-brook font-bold text-amber-400 mb-4">
                            🎮 Podsumowanie Tygodnia
                        </h1>
                        <p className="text-xl text-gray-300 mb-2">Prezentacja pełnoekranowa</p>
                        <p className="text-lg text-amber-300 mb-8">({formatDate(date)})</p>
                        
                        {/* Przycisk uruchomienia prezentacji */}
                        <button
                            onClick={togglePresentationFullscreen}
                            className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-xl font-bold transition-colors shadow-2xl text-2xl mb-6 hover:scale-105 transform"
                        >
                            🎬 Rozpocznij Prezentację
                        </button>
                        
                        <div className="max-w-md mx-auto">
                            <p className="text-sm text-gray-400 mb-2">
                                💡 Prezentacja dostępna tylko w trybie pełnoekranowym
                            </p>
                            <p className="text-xs text-gray-500">
                                <kbd className="bg-zinc-700 px-2 py-1 rounded">Escape</kbd> = wyjście • 
                                <kbd className="bg-zinc-700 px-2 py-1 rounded ml-1">Spacja/Klik</kbd> = kolejny krok
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Pełnoekranowa prezentacja - renderowana przez Portal */}
            {isPresentationFullscreen && typeof document !== 'undefined' && createPortal(
                <div 
                    className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900 text-white overflow-hidden cursor-pointer"
                    onClick={handleClick}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 2147483647 // Maksymalna wartość z-index
                    }}
                >
                    {/* Zawartość prezentacji - tylko tryb pełnoekranowy */}
                    {renderPresentationContent(true)}
                </div>,
                document.body // Renderuje bezpośrednio w body, poza layout Next.js
            )}
        </>
    );

    // Funkcja renderująca zawartość prezentacji
    function renderPresentationContent(isFullscreen: boolean) {
        return (
            <>
                {/* YouTube video - zawsze obecne w tle, widoczność kontrolowana przez currentStep */}
                <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${currentStep >= 1 ? 'opacity-100' : 'opacity-0'}`}>
                    <iframe
                        src="https://www.youtube-nocookie.com/embed/6BFhVrifW-0?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&start=0&playlist=6BFhVrifW-0&enablejsapi=1"
                        className="absolute inset-0"
                        style={{
                            width: '100vw',
                            height: '56.25vw',
                            minHeight: '100vh',
                            minWidth: '177.78vh',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            pointerEvents: 'none',
                            border: 'none'
                        }}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                    {/* Overlay dla lepszej czytelności tekstu */}
                    <div className="absolute inset-0 bg-black/40"></div>
                </div>
                {/* Intro slide */}
                {currentStep === 0 && (
                    <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">


                        {/* Animowane tło z avatarami - paski nachodzące na siebie */}
                        <div className="absolute inset-0 opacity-50 overflow-hidden">
                            <div className="flex h-full animate-scroll-left filter sepia hue-rotate-[315deg] saturate-[2] brightness-75">
                                {/* Powtarzane sekcje avatarów dla płynnego zapętlenia */}
                                {[...Array(6)].map((_, setIndex) => (
                                    <div key={`set-${setIndex}`} className="flex h-full">
                                        {randomAvatars.slice(setIndex * 16, (setIndex + 1) * 16).map((player, index) => (
                                            <div 
                                                key={`${player}-${index}-${setIndex}`} 
                                                className="relative h-full"
                                                style={{ 
                                                    marginLeft: index > 0 ? '-200px' : '0',
                                                    zIndex: index 
                                                }}
                                            >
                                                {/* Avatar na całą wysokość ekranu */}
                                                <div className="relative w-[48rem] h-full overflow-hidden shadow-2xl" style={{ clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)' }}>
                                                    <Image
                                                        src={`/images/avatars/${player}.png`}
                                                        alt={player}
                                                        fill
                                                        className="object-cover"
                                                        style={{ objectPosition: 'center' }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/images/avatars/placeholder.png';
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                            {/* Warstwa rozmycia */}
                            <div className="absolute inset-0 backdrop-blur"></div>
                            {/* Czerwony overlay na całe tło */}
                            <div className="absolute inset-0 bg-red-800/60 mix-blend-multiply"></div>
                        </div>

                        {/* Główna zawartość intro */}
                        <div 
                            className={`relative z-10 transition-all duration-1000 ease-out ${
                                currentStep === 0 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                        >
                            <div className="text-center">
                                <Image
                                    src="/images/intro.png"
                                    alt="Drama Afera Intro"
                                    width={isFullscreen ? 1000 : 700}
                                    height={isFullscreen ? 1000 : 700}
                                    className="mx-auto mb-8 drop-shadow-2xl relative z-20"
                                />
                                <p className={`text-amber-200 font-medium tracking-wider relative z-20 ${isFullscreen ? 'text-4xl' : 'text-lg'}`}>
                                    POWERED BY ZIOMSON & MALKIZ
                                </p>                              
                            </div>
                        </div>
                    </div>
                )}

                {/* Główna prezentacja - pokazuje się od kroku 1 */}
                {currentStep >= 1 && (
                    <>



                {/* Główne podium - używa grafiki podium.png */}
                <div className="fixed bottom-[-480px] left-0 right-0 flex justify-center items-end relative z-10">
                    <div className="relative">
                        {/* Grafika podium */}
                        <Image
                            src="/images/podium.png"
                            alt="Podium"
                            width={isFullscreen ? 1500 : 600}
                            height={isFullscreen ? 450 : 350}
                            className="relative z-0"
                        />
                        
                        {/* 2. miejsce - lewa pozycja */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '9%' : '12%', 
                            top: isFullscreen ? '-20%' : '8%',
                            width: isFullscreen ? '300px' : '150px',
                            height: isFullscreen ? '300px' : '150px'
                        }}>
                            {/* Kontener flip animacji */}
                            <div 
                                className={`flip-card-container ${
                                    currentStep >= 3 ? 'flip-card-flipped' : ''
                                }`}
                            >
                                {/* Tylna strona - znak zapytania */}
                                <div 
                                    className="absolute inset-0 bg-black/80 border-4 border-amber-400 rounded-lg flex items-center justify-center"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(0deg)'
                                    }}
                                >
                                    <div className="text-white text-9xl font-bold pixelated">?</div>
                                </div>
                                
                                {/* Przednia strona - avatar gracza */}
                                <div 
                                    className="absolute inset-0"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    {weeklyStats[1] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${weeklyStats[1].nickname}.png`}
                                                alt={weeklyStats[1].nickname}
                                                fill
                                                className="rounded-lg border-4 border-amber-400 shadow-xl object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/avatars/placeholder.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 1. miejsce - środkowa pozycja (najwyższa) */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '38%' : '42%', 
                            top: isFullscreen ? '-65%' : '2%',
                            width: isFullscreen ? '370px' : '105px',
                            height: isFullscreen ? '370px' : '105px'
                        }}>
                            {/* Kontener flip animacji */}
                            <div 
                                className={`relative w-full h-full transition-transform duration-1000 ${
                                    currentStep >= 4 ? 'flip-card-flipped' : ''
                                }`}
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    perspective: '1000px'
                                }}
                            >
                                {/* Tylna strona - znak zapytania */}
                                <div 
                                    className="absolute inset-0 bg-black/80 border-4 border-amber-400 rounded-lg flex items-center justify-center"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(0deg)'
                                    }}
                                >
                                    <div className="text-white text-9xl font-bold pixelated">?</div>
                                </div>
                                
                                {/* Przednia strona - avatar gracza */}
                                <div 
                                    className="absolute inset-0"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    {weeklyStats[0] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${weeklyStats[0].nickname}.png`}
                                                alt={weeklyStats[0].nickname}
                                                fill
                                                className="rounded-lg border-4 border-amber-300 shadow-2xl object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/avatars/placeholder.png';
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

                        {/* 3. miejsce - prawa pozycja */}
                        <div className="absolute" style={{ 
                            right: isFullscreen ? '8%' : '12%', 
                            top: isFullscreen ? '-10%' : '12%',
                            width: isFullscreen ? '300px' : '80px',
                            height: isFullscreen ? '300px' : '80px'
                        }}>
                            {/* Kontener flip animacji */}
                            <div 
                                className={`relative w-full h-full transition-transform duration-1000 ${
                                    currentStep >= 2 ? 'flip-card-flipped' : ''
                                }`}
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    perspective: '1000px'
                                }}
                            >
                                {/* Tylna strona - znak zapytania */}
                                <div 
                                    className="absolute inset-0 bg-black/80 border-4 border-amber-400 rounded-lg flex items-center justify-center"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(0deg)'
                                    }}
                                >
                                    <div className="text-white text-9xl font-bold pixelated">?</div>
                                </div>
                                
                                {/* Przednia strona - avatar gracza */}
                                <div 
                                    className="absolute inset-0"
                                    style={{ 
                                        backfaceVisibility: 'hidden',
                                        transform: 'rotateY(180deg)'
                                    }}
                                >
                                    {weeklyStats[2] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${weeklyStats[2].nickname}.png`}
                                                alt={weeklyStats[2].nickname}
                                                fill
                                                className="rounded-lg border-4 border-amber-400 shadow-lg object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/avatars/placeholder.png';
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Pozostałe miejsca */}
            {weeklyStats.length > 3 && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center flex-wrap gap-6 px-8 py-2 z-50 bg-gradient-to-t from-black/60 to-transparent">
                    {weeklyStats.slice(3).map((player: WeeklyPlayerStats, index: number) => {
                        const isVisible = currentStep >= 5;
                        
                        return (
                            <div 
                                key={player.nickname}
                                className={`flex flex-col items-center transition-all duration-700 ease-out transform ${
                                    isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-5'
                                }`}
                                style={{ transitionDelay: `${index * 150}ms` }}
                            >
                                <div className="relative mb-3">
                                    <Image
                                        src={`/images/avatars/${player.nickname}.png`}
                                        alt={player.nickname}
                                        width={100}
                                        height={100}
                                        className="rounded-lg border-4 border-amber-400 shadow-lg"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/avatars/placeholder.png';
                                        }}
                                    />
                                    <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center text-xs shadow-lg">
                                        {player.position}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
                    </>
                )}
            </>
        );
    }
}