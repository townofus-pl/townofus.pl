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

// Typy dla ankiety Emperor
interface EmperorPollVote {
    nickname: string;
    votes: number;
}

interface EmperorPoll {
    date: string;
    question: string;
    totalVotes: number;
    votes: EmperorPollVote[];
}

export default function WeeklySummaryPage() {
    const params = useParams();
    const date = params?.date as string;
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyPlayerStats[]>([]);
    const [emperorPoll, setEmperorPoll] = useState<EmperorPoll | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Oblicz liczbę graczy do odkrycia (od ostatniego do 4. miejsca)
    const remainingPlayersCount = Math.max(0, weeklyStats.length - 3);
    
    // Definicja slajdów i ich kroków
    const slides = [
        {
            id: 'intro',
            name: 'Intro',
            steps: 1 // Jeden krok - pokazanie intro
        },
        ...(emperorPoll ? [{
            id: 'emperor-poll',
            name: 'Ankieta Emperor',
            steps: 2 // Krok 0: pytanie, Krok 1: wykres
        }] : []),
        ...(remainingPlayersCount > 0 ? [{
            id: 'remaining',
            name: 'Pozostali gracze',
            steps: remainingPlayersCount + 1 // +1 krok na napis "PODSUMOWANIE DAP..."
        }] : []),
        {
            id: 'podium',
            name: 'Podium',
            steps: 4 // Krok 0: pusty, Krok 1: 3. miejsce, Krok 2: 2. miejsce, Krok 3: 1. miejsce
        }
    ];

    // Oblicz całkowitą liczbę slajdów
    const totalSlides = slides.length;

    // Funkcja do generowania losowej sekwencji avatarów z warunkiem odległości
    const generateRandomAvatars = (playerList: string[], count: number) => {
        const result: string[] = [];
        const recentPlayers: string[] = [];
        const minDistance = Math.min(5, Math.floor(playerList.length / 2)); // Dostosuj minDistance do liczby graczy

        for (let i = 0; i < count; i++) {
            // Dostępni gracze to wszyscy minus ostatnich X
            const availablePlayers = playerList.filter(player => !recentPlayers.includes(player));
            
            // Jeśli nie ma dostępnych graczy, resetuj listę ostatnich
            const playersToChooseFrom = availablePlayers.length > 0 ? availablePlayers : playerList;
            
            // Losuj gracza
            const randomPlayer = playersToChooseFrom[Math.floor(Math.random() * playersToChooseFrom.length)];
            result.push(randomPlayer);
            
            // Dodaj do listy ostatnich
            recentPlayers.push(randomPlayer);
            
            // Zachowaj tylko ostatnich X
            if (recentPlayers.length > minDistance) {
                recentPlayers.shift();
            }
        }

        return result;
    };

    // Generuj losową sekwencję avatarów - aktualizowana gdy zmienią się weeklyStats
    const [randomAvatars, setRandomAvatars] = useState<string[]>([]);
    
    useEffect(() => {
        if (weeklyStats.length > 0) {
            const playerNicknames = weeklyStats.map(p => p.nickname);
            setRandomAvatars(generateRandomAvatars(playerNicknames, 96)); // 6 setów po 16 avatarów
        }
    }, [weeklyStats]);

    // Funkcja do przejścia do kolejnego kroku/slajdu
    const handleNext = useCallback(() => {
        const currentSlideConfig = slides[currentSlide];
        
        // Jeśli są jeszcze kroki w bieżącym slajdzie
        if (currentStep < currentSlideConfig.steps - 1) {
            // Sprawdź czy to odkrycie 1. miejsca na podium (step 2->3)
            if (currentSlideConfig.id === 'podium' && currentStep === 2) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000); // Confetti przez 5 sekund
            }
            setCurrentStep(currentStep + 1);
        } 
        // Jeśli to ostatni krok w slajdzie, przejdź do następnego slajdu
        else if (currentSlide < totalSlides - 1) {
            const nextSlideConfig = slides[currentSlide + 1];
            
            // Fade transition przy przejściu z 'intro' lub 'remaining' do następnego slajdu
            if (currentSlideConfig.id === 'intro' || 
                (currentSlideConfig.id === 'remaining' && nextSlideConfig.id === 'podium')) {
                setIsTransitioning(true);
                setTimeout(() => {
                    setCurrentSlide(currentSlide + 1);
                    setCurrentStep(0);
                    setTimeout(() => setIsTransitioning(false), 100);
                }, 500); // Fade out trwa 500ms, potem zmiana slajdu
            } else {
                setCurrentSlide(currentSlide + 1);
                setCurrentStep(0);
            }
        }
        // Jeśli to ostatni slajd i ostatni krok, zresetuj
        else {
            setCurrentSlide(0);
            setCurrentStep(0);
        }
    }, [currentSlide, currentStep, slides, totalSlides]);

    // Pobieranie danych tygodniowych i ankiety
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Pobierz statystyki tygodniowe
                const statsResponse = await fetch(`/api/dramaafera/weekly-stats/${date}`);
                const statsData: WeeklyStatsResponse = await statsResponse.json();
                
                if (statsData.success && statsData.data) {
                    setWeeklyStats(statsData.data.players);
                } else {
                    setError(statsData.error || 'Nie udało się pobrać danych');
                }
                
                // Spróbuj pobrać ankietę Emperor (opcjonalne)
                try {
                    const pollResponse = await fetch(`/emperor-polls/${date}.json`);
                    if (pollResponse.ok) {
                        const pollData: EmperorPoll = await pollResponse.json();
                        setEmperorPoll(pollData);
                    }
                } catch (pollErr) {
                    // Ankieta opcjonalna - brak pliku nie jest błędem
                    console.log('No emperor poll found for this date');
                }
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Błąd połączenia z serwerem');
            } finally {
                setLoading(false);
            }
        };

        if (date) {
            fetchData();
        }
    }, [date]);

    // Kroki animacji: 0=intro, 1=tytuł, 2=3.miejsce, 3=2.miejsce, 4=1.miejsce, 5=pozostałe miejsca
    // STARE: const maxSteps = weeklyStats.length > 0 ? (weeklyStats.length > 3 ? 5 : 4) : 1;

    const handleClick = useCallback(() => {
        handleNext();
    }, [handleNext]);

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
                handleNext();
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
    }, [isPresentationFullscreen, handleNext]);

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
                    className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-amber-900 text-white overflow-hidden cursor-pointer select-none"
                    onClick={handleClick}
                    style={{ 
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        zIndex: 2147483647, // Maksymalna wartość z-index
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                >
                    {/* Zawartość prezentacji - tylko tryb pełnoekranowy */}
                    {renderPresentationContent(true)}
                </div>,
                document.body // Renderuje bezpośrednio w body, poza layout Next.js
            )}
            
            {/* Globalne style dla animacji */}
            <style jsx global>{`
                @keyframes confettiFall {
                    0% {
                        transform: translateY(0) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(110vh) rotate(720deg);
                        opacity: 0;
                    }
                }
            `}</style>
        </>
    );

    // Funkcja renderująca zawartość prezentacji
    function renderPresentationContent(isFullscreen: boolean) {
        return (
            <>
                {/* YouTube video - zawsze obecne w tle od slajdu 1 wzwyż */}
                <div className={`absolute inset-0 overflow-hidden transition-opacity duration-1000 ${currentSlide >= 1 ? 'opacity-100' : 'opacity-0'}`}>
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



                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
                        {[...Array(50)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: '-10%',
                                    width: '10px',
                                    height: '10px',
                                    backgroundColor: ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#ec4899'][Math.floor(Math.random() * 5)],
                                    animation: `confettiFall ${2 + Math.random() * 3}s linear forwards`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                    transform: `rotate(${Math.random() * 360}deg)`
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* SLAJD 0: Intro */}
                {currentSlide === 0 && (
                    <div 
                        className="absolute inset-0"
                        style={{
                            opacity: isTransitioning ? 0 : 1,
                            transition: 'opacity 0.5s ease-out'
                        }}
                    >
                        {renderIntroSlide(isFullscreen)}
                    </div>
                )}

                {/* SLAJD: Ankieta Emperor (jeśli istnieje) */}
                {slides[currentSlide]?.id === 'emperor-poll' && renderEmperorPollSlide(isFullscreen)}

                {/* SLAJD: Pozostali gracze (jeśli istnieją) */}
                {slides[currentSlide]?.id === 'remaining' && (
                    <div 
                        className="absolute inset-0"
                        style={{
                            opacity: isTransitioning ? 0 : 1,
                            transition: 'opacity 0.5s ease-out'
                        }}
                    >
                        {renderRemainingPlayersSlide(isFullscreen)}
                    </div>
                )}

                {/* SLAJD: Podium */}
                {slides[currentSlide]?.id === 'podium' && (
                    <div 
                        className="absolute inset-0"
                        style={{
                            opacity: isTransitioning ? 0 : 1,
                            animation: isTransitioning ? 'none' : 'fadeIn 0.6s ease-in forwards'
                        }}
                    >
                        {renderPodiumSlide(isFullscreen)}
                    </div>
                )}
            </>
        );
    }

    // SLAJD 0: Intro slide
    function renderIntroSlide(isFullscreen: boolean) {
        // Jeśli nie ma jeszcze wygenerowanych avatarów, nie renderuj tła
        if (randomAvatars.length === 0) {
            return (
                <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
                    {/* Główna zawartość intro bez tła */}
                    <div className="relative z-10 transition-all duration-1000 ease-out opacity-100 scale-100">
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
            );
        }
        
        return (
            <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
                {/* Animowane tło z avatarami - tylko graczy z tego tygodnia */}
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
                <div className="relative z-10 transition-all duration-1000 ease-out opacity-100 scale-100">
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
        );
    }

    // SLAJD: Ankieta Emperor
    function renderEmperorPollSlide(isFullscreen: boolean) {
        if (!emperorPoll) return null;

        // Krok 0: Pytanie
        if (currentStep === 0) {
            return (
                <div className="relative flex items-center justify-center h-full">
                    <div className="text-center px-8">
                        <h1 
                            className={`font-bold text-amber-400 leading-tight ${isFullscreen ? 'text-7xl' : 'text-4xl'}`}
                            style={{
                                textShadow: '0 0 20px rgba(251, 191, 36, 0.5)'
                            }}
                        >
                            KTO ZOSTANIE EMPEROREM<br />WEDŁUG ANKIETOWANYCH?
                        </h1>
                    </div>
                </div>
            );
        }

        // Krok 1: Wykres słupkowy - posortowany od najwyższego do najniższego
        const sortedVotes = [...emperorPoll.votes].sort((a, b) => b.votes - a.votes);
        const maxVotes = Math.max(...sortedVotes.map(v => v.votes));
        const chartHeight = isFullscreen ? 400 : 250;
        const barWidth = isFullscreen ? 120 : 80;
        const gap = isFullscreen ? 40 : 20;
        const avatarSize = isFullscreen ? 80 : 50;

        return (
            <div className="relative flex items-center justify-center h-full px-8">
                <div className="flex flex-col items-center w-full max-w-7xl">
                    {/* Tytuł */}
                    <h2 className={`font-bold text-amber-400 mb-8 ${isFullscreen ? 'text-5xl' : 'text-3xl'}`}>
                        WYNIKI ANKIETY
                    </h2>

                    {/* Wykres słupkowy */}
                    <div className="flex items-end justify-center" style={{ gap: `${gap}px`, minHeight: `${chartHeight + 150}px` }}>
                        {sortedVotes.map((vote, index) => {
                            const barHeight = Math.max(50, (vote.votes / maxVotes) * chartHeight);
                            const percentage = Math.round((vote.votes / emperorPoll.totalVotes) * 100);

                            return (
                                <div 
                                    key={vote.nickname}
                                    className="flex flex-col items-center"
                                    style={{ width: `${barWidth}px` }}
                                >
                                    {/* Liczba głosów i procent nad słupkiem */}
                                    <div 
                                        className="text-center mb-2"
                                        style={{ 
                                            opacity: 0,
                                            animation: `fadeIn 0.6s ease-out ${index * 0.1}s forwards`
                                        }}
                                    >
                                        <div className={`font-bold text-amber-300 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                                            {vote.votes}
                                        </div>
                                        <div className={`font-bold text-amber-400 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                            {percentage}%
                                        </div>
                                    </div>

                                    {/* Słupek */}
                                    <div 
                                        className="relative w-full rounded-t-lg bg-gradient-to-t from-amber-600 to-amber-400 shadow-xl"
                                        style={{ 
                                            height: `${barHeight}px`,
                                            opacity: 0,
                                            animation: `slideUpBar 0.8s ease-out ${index * 0.1}s forwards`
                                        }}
                                    >
                                        {/* Efekt połysku */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-t-lg"></div>
                                    </div>

                                    {/* Avatar i nick gracza - zawsze na dole */}
                                    <div 
                                        className="flex flex-col items-center mt-4"
                                        style={{ 
                                            opacity: 0,
                                            animation: `fadeIn 0.6s ease-out ${index * 0.1 + 0.4}s forwards`
                                        }}
                                    >
                                        <div 
                                            className="relative rounded-lg overflow-hidden border-4 border-amber-400 shadow-xl"
                                            style={{ 
                                                width: `${avatarSize}px`, 
                                                height: `${avatarSize}px`
                                            }}
                                        >
                                            <Image
                                                src={`/images/avatars/${vote.nickname}.png`}
                                                alt={vote.nickname}
                                                width={avatarSize}
                                                height={avatarSize}
                                                className="object-cover"
                                                priority
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = '/images/avatars/placeholder.png';
                                                }}
                                            />
                                        </div>
                                        <div className={`font-bold text-white mt-2 text-center ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                            {vote.nickname}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Animacje keyframes */}
                <style jsx>{`
                    @keyframes slideUpBar {
                        from {
                            opacity: 0;
                            transform: scaleY(0);
                            transform-origin: bottom;
                        }
                        to {
                            opacity: 1;
                            transform: scaleY(1);
                            transform-origin: bottom;
                        }
                    }
                    
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

    // SLAJD: Podium z krokami
    function renderPodiumSlide(isFullscreen: boolean) {
        // Sortuj według punktów DAP (malejąco) żeby mieć prawidłową TOP 3
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        
        return (
            <>
                {/* Główne podium - używa grafiki podium.png */}
                <div className="fixed bottom-[-334px] left-0 right-0 flex justify-center items-end relative z-10">
                    <div className="relative">
                        {/* Grafika podium */}
                        <Image
                            src="/images/podium.png"
                            alt="Podium"
                            width={isFullscreen ? 1300 : 600}
                            height={isFullscreen ? 450 : 350}
                            className="relative z-0"
                        />
                        
                        {/* 3. miejsce - prawa pozycja - pokazuje się w kroku 1 */}
                        <div className="absolute" style={{ 
                            right: isFullscreen ? '12.5%' : '12%', 
                            top: isFullscreen ? '28%' : '12%',
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
                                    <div className={`font-bold text-amber-400 ${isFullscreen ? 'text-3xl' : 'text-xl'} mb-1`}>
                                        {sortedStats[2].nickname}
                                    </div>
                                    <div className={`font-bold text-amber-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
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
                                    {sortedStats[2] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${sortedStats[2].nickname}.png`}
                                                alt={sortedStats[2].nickname}
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

                        {/* 2. miejsce - lewa pozycja - pokazuje się w kroku 2 */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '12%' : '12%', 
                            top: isFullscreen ? '22%' : '8%',
                            width: isFullscreen ? '260px' : '150px',
                            height: isFullscreen ? '260px' : '150px'
                        }}>
                            {/* Napisy nad avatarem - pokazują się po odkryciu */}
                            {currentStep >= 2 && sortedStats[1] && (
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
                                    <div className={`font-bold text-amber-400 ${isFullscreen ? 'text-3xl' : 'text-xl'} mb-1`}>
                                        {sortedStats[1].nickname}
                                    </div>
                                    <div className={`font-bold text-amber-300 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                        {sortedStats[1].totalPoints} DAP
                                    </div>
                                </div>
                            )}
                            
                            <div 
                                className={`flip-card-container ${
                                    currentStep >= 2 ? 'flip-card-flipped' : ''
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
                                    {sortedStats[1] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${sortedStats[1].nickname}.png`}
                                                alt={sortedStats[1].nickname}
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

                        {/* 1. miejsce - środkowa pozycja (najwyższa) - pokazuje się w kroku 3 */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '36%' : '42%', 
                            top: isFullscreen ? '-13%' : '2%',
                            width: isFullscreen ? '370px' : '105px',
                            height: isFullscreen ? '370px' : '105px'
                        }}>
                            {/* Napisy nad avatarem - EMPEROR, nick, DAP */}
                            {currentStep >= 3 && sortedStats[0] && (
                                <div 
                                    className="absolute left-1/2 -translate-x-1/2 text-center"
                                    style={{ 
                                        bottom: '100%',
                                        marginBottom: isFullscreen ? '30px' : '15px',
                                        width: isFullscreen ? '400px' : '200px',
                                        opacity: 0,
                                        animation: 'fadeIn 1s ease-out 0.5s forwards'
                                    }}
                                >
                                    <div className={`font-bold text-red-500 ${isFullscreen ? 'text-5xl' : 'text-2xl'} mb-2 tracking-wider`}>
                                        EMPEROR
                                    </div>
                                    <div className={`font-bold text-amber-400 ${isFullscreen ? 'text-4xl' : 'text-2xl'} mb-1`}>
                                        {sortedStats[0].nickname}
                                    </div>
                                    <div className={`font-bold text-amber-300 ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
                                        {sortedStats[0].totalPoints} DAP
                                    </div>
                                </div>
                            )}
                            
                            <div 
                                className={`relative w-full h-full transition-transform duration-1000 ${
                                    currentStep >= 3 ? 'flip-card-flipped' : ''
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
                                    {sortedStats[0] && (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={`/images/avatars/${sortedStats[0].nickname}.png`}
                                                alt={sortedStats[0].nickname}
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
                    </div>
                </div>

                {/* Animacja keyframes dla napisów */}
                <style jsx>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>
            </>
        );
    }

    // SLAJD: Pozostałe miejsca - prosta lista od dołu
    function renderRemainingPlayersSlide(isFullscreen: boolean) {
        // Sortuj według punktów DAP (malejąco) - tak samo jak w hostinfo
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Gracze do odkrycia (od ostatniego miejsca do 4. miejsca)
        const playersToReveal = sortedStats.slice(3).reverse(); // Bierzemy od 4. miejsca w górę i odwracamy
        
        if (playersToReveal.length === 0) {
            return null;
        }

        // Liczba graczy do pokazania (currentStep, bo krok 0 to napis)
        const visibleCount = currentStep;
        const visiblePlayers = playersToReveal.slice(0, visibleCount);

        // Automatyczne skalowanie do wysokości ekranu
        const maxPlayers = playersToReveal.length;
        const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        // 82% wysokości ekranu dostępne dla listy (zostawiamy 18% na marginesy)
        const availableHeight = screenHeight * 0.82;
        
        // Gap między elementami - stały
        const gapSize = 12;
        
        // Wysokość dostępna dla elementów (po odjęciu odstępów)
        const totalGapHeight = (maxPlayers - 1) * gapSize;
        const heightForItems = availableHeight - totalGapHeight;
        
        // Wysokość pojedynczego elementu - dokładnie obliczona
        const calculatedItemHeight = Math.floor(heightForItems / maxPlayers);
        
        // Dynamiczne rozmiary na podstawie dostępnej przestrzeni
        const avatarSize = Math.max(28, Math.min(100, calculatedItemHeight - 16));
        const numberWidth = Math.max(45, Math.min(80, calculatedItemHeight * 0.6));
        const fontSize = calculatedItemHeight >= 100 ? 'text-4xl' : 
                        calculatedItemHeight >= 80 ? 'text-3xl' : 
                        calculatedItemHeight >= 60 ? 'text-2xl' : 
                        calculatedItemHeight >= 45 ? 'text-xl' : 'text-lg';
        const smallFontSize = calculatedItemHeight >= 100 ? 'text-2xl' : 
                             calculatedItemHeight >= 80 ? 'text-xl' : 
                             calculatedItemHeight >= 60 ? 'text-lg' : 
                             calculatedItemHeight >= 45 ? 'text-base' : 'text-sm';
        const padding = Math.max(6, Math.min(16, calculatedItemHeight * 0.12));

        // Krok 0: Tylko napis
        if (currentStep === 0) {
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <h1 
                        className={`font-bold text-amber-400 text-center ${isFullscreen ? 'text-7xl' : 'text-5xl'}`}
                        style={{
                            textShadow: '0 0 40px rgba(251, 191, 36, 0.7)'
                        }}
                    >
                        PODSUMOWANIE DAP<br />Z OSTATNIEJ SESJI
                    </h1>
                </div>
            );
        }

        // Krok 1+: Lista graczy (currentStep - 1 bo odejmujemy krok z napisem)
        return (
            <div className="absolute inset-0 flex flex-col justify-center items-center" style={{ padding: '9vh 0' }}>
                <div className="relative w-full flex justify-center">
                    {/* Lista graczy od dołu do góry - każdy na swojej pozycji */}
                    <div 
                        className="flex flex-col-reverse" 
                        style={{ 
                            width: '100%', 
                            maxWidth: isFullscreen ? '900px' : '700px',
                            gap: `${gapSize}px`
                        }}
                    >
                        {playersToReveal.map((player, index) => {
                            // Sprawdź czy ten gracz jest już widoczny
                            const isVisible = index < visibleCount;
                            const isNew = index === visibleCount - 1;
                            // Oblicz pozycję: playersToReveal są odwróceni, więc ostatni w tablicy to 4. miejsce
                            const actualPosition = playersToReveal.length - index + 3; // +3 bo top 3 nie jest w tej liście
                            
                            // Jeśli niewidoczny, renderuj placeholder z identyczną strukturą
                            if (!isVisible) {
                                return (
                                    <div
                                        key={`placeholder-${player.nickname}`}
                                        className="flex items-center bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm rounded-lg shadow-2xl"
                                        style={{
                                            padding: `${padding}px ${padding * 1.5}px`,
                                            minHeight: `${calculatedItemHeight}px`,
                                            gap: `${Math.max(6, padding * 0.8)}px`,
                                            border: `${calculatedItemHeight < 60 ? '1px' : '2px'} solid rgba(251, 191, 36, 0.5)`,
                                            visibility: 'hidden'
                                        }}
                                    >
                                        {/* Numer pozycji - placeholder */}
                                        <div 
                                            className={`font-bold text-amber-400 ${fontSize} flex-shrink-0`}
                                            style={{ width: `${numberWidth}px`, textAlign: 'center' }}
                                        >
                                            #
                                        </div>

                                        {/* Avatar - placeholder */}
                                        <div 
                                            className="relative rounded-lg overflow-hidden border-amber-400 shadow-xl flex-shrink-0"
                                            style={{ 
                                                width: `${avatarSize}px`, 
                                                height: `${avatarSize}px`,
                                                borderWidth: calculatedItemHeight < 60 ? '2px' : '3px'
                                            }}
                                        />

                                        {/* Nick i punkty - placeholder */}
                                        <div className="flex-grow">
                                            <div className={`font-bold text-white ${fontSize} leading-tight mb-1`}>
                                                &nbsp;
                                            </div>
                                            <div className={`text-amber-300 ${smallFontSize} leading-tight`}>
                                                &nbsp;
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            
                            // Renderuj widocznego gracza
                            return (
                                <div
                                    key={player.nickname}
                                    className="flex items-center bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm rounded-lg shadow-2xl"
                                    style={{
                                        padding: `${padding}px ${padding * 1.5}px`,
                                        minHeight: `${calculatedItemHeight}px`,
                                        gap: `${Math.max(6, padding * 0.8)}px`,
                                        border: `${calculatedItemHeight < 60 ? '1px' : '2px'} solid rgba(251, 191, 36, 0.5)`,
                                        opacity: isNew ? 0 : 1,
                                        animation: isNew ? 'fadeInSlide 0.7s ease-out forwards' : 'none'
                                    }}
                                >
                                    {/* Numer pozycji */}
                                    <div 
                                        className={`font-bold text-amber-400 ${fontSize} flex-shrink-0`}
                                        style={{ width: `${numberWidth}px`, textAlign: 'center' }}
                                    >
                                        #{actualPosition}
                                    </div>

                                    {/* Avatar */}
                                    <div 
                                        className="relative rounded-lg overflow-hidden border-amber-400 shadow-xl flex-shrink-0"
                                        style={{ 
                                            width: `${avatarSize}px`, 
                                            height: `${avatarSize}px`,
                                            borderWidth: calculatedItemHeight < 60 ? '2px' : '3px'
                                        }}
                                    >
                                        <Image
                                            src={`/images/avatars/${player.nickname}.png`}
                                            alt={player.nickname}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/images/avatars/placeholder.png';
                                            }}
                                        />
                                    </div>

                                    {/* Nick i punkty */}
                                    <div className="flex-grow">
                                        <div className={`font-bold text-white ${fontSize} leading-tight mb-1`}>
                                            {player.nickname}
                                        </div>
                                        <div className={`text-amber-300 ${smallFontSize} leading-tight`}>
                                            <span className="font-bold">{player.totalPoints}</span> DAP
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Animacja keyframes */}
                <style jsx>{`
                    @keyframes fadeInSlide {
                        from {
                            opacity: 0;
                        }
                        to {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        );
    }

}
