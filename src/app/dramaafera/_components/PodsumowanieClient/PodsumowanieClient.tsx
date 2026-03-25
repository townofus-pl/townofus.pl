"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { PodsumowanieClientProps } from './types';
import { formatDate, PODIUM_STANDARD_STEPS, PODIUM_TIE_STEPS } from './constants';
import IntroSlide from './IntroSlide';
import EmperorPollSlide from './EmperorPollSlide';
import RemainingPlayersSlide from './RemainingPlayersSlide';
import PodiumSlide from './PodiumSlide';
import SigmasSlide from './SigmasSlide';
import CweleSlide from './CweleSlide';
import EmperorHistorySlide from './EmperorHistorySlide';
import FinalRankingSlide from './FinalRankingSlide';

export default function PodsumowanieClient({
    date,
    weeklyStats,
    emperorPoll,
    topSigmas,
    sigmaRankingHistory,
    topCwele,
    cwelRankingHistory,
    emperorHistory,
    rankingAfterSession,
    topPlayerGames,
    playerRankingChangesCache,
}: PodsumowanieClientProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
    const [playerRankingChanges, setPlayerRankingChanges] = useState<Record<string, number>>(() => {
        // Inicjalizuj z cache dla TOP1 gracza
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        const topPlayer = sortedStats[0];
        if (topPlayer) {
            return playerRankingChangesCache[topPlayer.nickname] ?? {};
        }
        return {};
    });
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [introBlackOverlay, setIntroBlackOverlay] = useState(true);
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null); // Ref zamiast state - nie triggeruje re-render
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null); // Ref dla interwału fade audio
    const pendingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]); // Ref dla oczekujących timerów
    const [introInitialDelayPassed, setIntroInitialDelayPassed] = useState(false); // Czy minęło początkowe opóźnienie intro

    // Konfiguracja automatycznej sekwencji intro
    const INTRO_INITIAL_DELAY = 760; // ms - opóźnienie przed pierwszym tekstem po zniknięciu czarnego ekranu
    // Czasy trwania dla każdego kroku (A, B, C, D, E, F, G) w ms
    const INTRO_STEP_DURATIONS = useMemo(() => [
        240, // A
        230, // MONG
        250, // US
        235, // DRA
        230, // MA
        225, // A
        290  // FE
    ], []);

    // Pre-compute confetti random values - regenerowane przy każdym włączeniu confetti
    const generateConfettiPieces = () => {
        const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#ef4444', '#ec4899'];
        return [...Array(50)].map(() => ({
            left: Math.random() * 100,
            color: CONFETTI_COLORS[Math.floor(Math.random() * 5)],
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 0.5,
            rotation: Math.random() * 360,
        }));
    };
    const [confettiPieces, setConfettiPieces] = useState(generateConfettiPieces);

    // Sprawdź czy jest remis na 3. miejscu (dwóch graczy z takimi samymi punktami)
    const sortedStatsForTieCheck = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
    const hasThirdPlaceTie = sortedStatsForTieCheck.length >= 4 && 
        sortedStatsForTieCheck[2].totalPoints === sortedStatsForTieCheck[3].totalPoints;

    // Oblicz liczbę graczy do odkrycia
    // Gdy jest remis na 3. miejscu: od 5. miejsca (pomijamy dwóch na 3. miejscu)
    // Normalnie: od 4. miejsca (pomijamy top 3)
    const remainingPlayersCount = hasThirdPlaceTie
        ? Math.max(0, weeklyStats.length - 4)  // Od 5. miejsca
        : Math.max(0, weeklyStats.length - 3); // Od 4. miejsca
    
    // Definicja slajdów i ich kroków
    const slides = useMemo(() => [
        {
            id: 'intro',
            name: 'Intro',
            steps: 8 // 7 tekstów (A-G) + finalne intro (logo)
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
            steps: (() => {
                const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
                const hasThirdPlaceTie = sortedStats.length >= 4 && sortedStats[2].totalPoints === sortedStats[3].totalPoints;
                // Przy remisie: 0=pusty, 1=odkrycie 3., 2=historia 1. z remisu, 3=historia 2. z remisu, 4=powrót, 5=2., 6=historia 2., 7=powrót, 8=1., 9=historia 1.
                // Normalnie: 0=pusty, 1=3., 2=historia 3., 3=powrót, 4=2., 5=historia 2., 6=powrót, 7=1. (EMPEROR), 8=historia 1.
                return hasThirdPlaceTie ? PODIUM_TIE_STEPS.total : PODIUM_STANDARD_STEPS.total;
            })()
        },
        ...(topSigmas.length >= 3 ? [{
            id: 'sigmas',
            name: 'Największe Sigmy',
            steps: (() => {
                const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
                const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);
                const top1Sigma = topSigmas[0];
                const top1WasInTop3 = top3Nicknames.includes(top1Sigma.nickname);
                return top1WasInTop3 ? 4 : 5; // 0=tytuł, 1-3=sigmy, 4=historia top1 (jeśli nie był w top3)
            })()
        }] : []),
        ...(topCwele.length >= 3 ? [{
            id: 'cwele',
            name: 'Największe Cwele',
            steps: (() => {
                const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
                const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);
                const top1Cwel = topCwele[0];
                const top1WasInTop3 = top3Nicknames.includes(top1Cwel.nickname);
                return top1WasInTop3 ? 4 : 5; // 0=tytuł, 1-3=cwele, 4=historia top1 (jeśli nie był w top3)
            })()
        }] : []),
        ...(emperorHistory.length > 0 ? [{
            id: 'emperor-history',
            name: 'Lista de Emperadores',
            steps: 2 // Krok 0: tytuł, Krok 1: cała lista
        }] : []),
        ...(rankingAfterSession.length > 0 ? [{
            id: 'final-ranking',
            name: 'Ranking po sesji',
            steps: 2 // Krok 0: tytuł, Krok 1: cała tabela z animacją
        }] : [])
    ], [emperorPoll, remainingPlayersCount, topSigmas, topCwele, emperorHistory.length, rankingAfterSession.length, weeklyStats]);

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

    // Automatyczne przełączanie kroków w slajdzie intro (kroki 0-6 to teksty A-G, krok 7 to finalne intro)
    useEffect(() => {
        const currentSlideConfig = slides[currentSlide];
        
        // Tylko dla slajdu intro i tylko gdy nie ma czarnego overlay
        if (currentSlideConfig?.id === 'intro' && !introBlackOverlay && isPresentationFullscreen) {
            // Krok 0: Początkowe opóźnienie (pusty czarny ekran)
            if (currentStep === 0 && !introInitialDelayPassed) {
                const initialTimer = setTimeout(() => {
                    setIntroInitialDelayPassed(true);
                }, INTRO_INITIAL_DELAY);
                
                return () => clearTimeout(initialTimer);
            }
            
            // Krok 0-6: Automatyczne przełączanie tekstów (A-G) - tylko gdy minęło początkowe opóźnienie
            if (currentStep < 7 && introInitialDelayPassed) {
                // Czas wyświetlania dla danego tekstu
                const delay = INTRO_STEP_DURATIONS[currentStep];
                
                const timer = setTimeout(() => {
                    setCurrentStep(currentStep + 1);
                }, delay);
                
                return () => clearTimeout(timer);
            }
            // Krok 7: Finalne intro - czeka na kliknięcie użytkownika
        }
    }, [currentSlide, currentStep, introBlackOverlay, isPresentationFullscreen, introInitialDelayPassed, slides, INTRO_STEP_DURATIONS]);

    // Funkcja do przejścia do kolejnego kroku/slajdu
    const handleNext = useCallback(() => {
        const currentSlideConfig = slides[currentSlide];
        
        // Specjalna obsługa pierwszego slajdu intro - usuń czarną warstwę i uruchom muzykę
        // Kroki 0-6 są automatyczne — kliknięcia nie powinny ich przyspieszać
        if (currentSlideConfig.id === 'intro' && introBlackOverlay) {
            setIntroBlackOverlay(false);
            
            // Uruchom muzykę w tle - używamy Ref zamiast state żeby uniknąć cleanup
            // Muzyka uruchamia się PO kliknięciu, więc przeglądarka już nie blokuje autoplay
            if (!backgroundMusicRef.current) {
                const audio = new Audio('/sounds/among us DRAMA AFERA.mp3');
                audio.loop = true;
                audio.volume = 1.0;
                
                // Zapisz audio NAJPIERW, potem play
                backgroundMusicRef.current = audio;
                
                // Opóźniamy play() o 100ms żeby przeglądarka nie myślała że to autoplay
                setTimeout(() => {
                    audio.play().catch(() => {
                        // Autoplay zablokowany — ignorujemy
                    });
                }, 100);
                // NIE USTAWIAMY STATE - tylko Ref! State triggeruje re-render i cleanup
            }
            
            return;
        }
        
        // Kroki 0-6 intro są automatyczne - ignoruj kliknięcia podczas ich trwania
        if (currentSlideConfig.id === 'intro' && !introBlackOverlay && currentStep < 7) {
            return;
        }
        
        // Jeśli są jeszcze kroki w bieżącym slajdzie
        if (currentStep < currentSlideConfig.steps - 1) {
            const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
            const hasThirdPlaceTie = sortedStats.length >= 4 && sortedStats[2].totalPoints === sortedStats[3].totalPoints;
            
            if (currentSlideConfig.id === 'podium' && 
                ((hasThirdPlaceTie && currentStep === PODIUM_TIE_STEPS.firstPlaceReveal - 1) ||
                 (!hasThirdPlaceTie && currentStep === PODIUM_STANDARD_STEPS.firstPlaceReveal - 1))) {
                setShowConfetti(true);
                setConfettiPieces(generateConfettiPieces());
                const confettiTimer = setTimeout(() => setShowConfetti(false), 5000); // Confetti przez 5 sekund
                pendingTimersRef.current.push(confettiTimer);
            }
            
            // Fade transition między sigmami, cwelami i emperor-history (każdy krok od kroku 0)
            if ((currentSlideConfig.id === 'sigmas' || currentSlideConfig.id === 'cwele' || currentSlideConfig.id === 'emperor-history') && currentStep >= 0) {
                setIsTransitioning(true);
                const t1 = setTimeout(() => {
                    setCurrentStep(prev => prev + 1);
                    const t2 = setTimeout(() => setIsTransitioning(false), 100);
                    pendingTimersRef.current.push(t2);
                }, 500);
                pendingTimersRef.current.push(t1);
            } else {
                setCurrentStep(currentStep + 1);
            }
        } 
        // Jeśli to ostatni krok w slajdzie, przejdź do następnego slajdu
        else if (currentSlide < totalSlides - 1) {
            const nextSlideConfig = slides[currentSlide + 1];
            
            // Ścisz muzykę po przejściu z intro (teraz już audio istnieje!) - płynne przejście
            if (currentSlideConfig.id === 'intro' && backgroundMusicRef.current) {
                const audio = backgroundMusicRef.current;
                const startVolume = audio.volume;
                const targetVolume = 0.15; // 13% głośności
                const fadeDuration = 1000; // 1 sekunda
                const fadeSteps = 50; // 50 kroków
                const stepDuration = fadeDuration / fadeSteps;
                const volumeStep = (startVolume - targetVolume) / fadeSteps;
                
                let fadeStep = 0;
                if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = setInterval(() => {
                    fadeStep++;
                    const newVolume = startVolume - (volumeStep * fadeStep);
                    
                    if (fadeStep >= fadeSteps || newVolume <= targetVolume) {
                        audio.volume = targetVolume;
                        if (fadeIntervalRef.current) {
                            clearInterval(fadeIntervalRef.current);
                            fadeIntervalRef.current = null;
                        }
                    } else {
                        audio.volume = newVolume;
                    }
                }, stepDuration);
            }
            
            // Fade transition przy przejściu z 'intro', 'remaining', 'sigmas', 'cwele', lub 'emperor-history' do następnego slajdu
            if (currentSlideConfig.id === 'intro' || 
                currentSlideConfig.id === 'sigmas' ||
                currentSlideConfig.id === 'cwele' ||
                currentSlideConfig.id === 'emperor-history' ||
                (currentSlideConfig.id === 'remaining' && nextSlideConfig.id === 'podium')) {
                setIsTransitioning(true);
                
                // Specjalne opóźnienie dla przejścia z intro - 1 sekunda zamiast 0.5s
                const transitionDelay = currentSlideConfig.id === 'intro' ? 1000 : 500;
                
                const t3 = setTimeout(() => {
                    setCurrentSlide(prev => prev + 1);
                    setCurrentStep(0);
                    const t4 = setTimeout(() => setIsTransitioning(false), 100);
                    pendingTimersRef.current.push(t4);
                }, transitionDelay);
                pendingTimersRef.current.push(t3);
            } else {
                setCurrentSlide(currentSlide + 1);
                setCurrentStep(0);
            }
        }
        // Jeśli to ostatni slajd i ostatni krok, zresetuj
        else {
            setCurrentSlide(0);
            setCurrentStep(0);
            setIntroBlackOverlay(true); // Przywróć czarną warstwę dla restartu
            setIntroInitialDelayPassed(false); // Zresetuj stan początkowego opóźnienia
            
            // Zatrzymaj muzykę i zresetuj
            if (backgroundMusicRef.current) {
                backgroundMusicRef.current.pause();
                backgroundMusicRef.current.currentTime = 0;
                backgroundMusicRef.current = null;
                // NIE USTAWIAMY STATE
            }
        }
    }, [currentSlide, currentStep, slides, totalSlides, introBlackOverlay, weeklyStats]);

    // Efekt do aktualizacji wyświetlanych zmian rankingu w zależności od aktualnie wyświetlanego gracza
    useEffect(() => {
        // Sprawdź który gracz jest aktualnie wyświetlany w historii gier
        if (weeklyStats.length === 0 || topPlayerGames.length === 0) return;

        const currentSlideConfig = slides[currentSlide];
        if (!currentSlideConfig) return;

        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        const hasThirdPlaceTie = sortedStats.length >= 4 &&
            sortedStats[2].totalPoints === sortedStats[3].totalPoints;

        let playerToShow: string | null = null;

        if (currentSlideConfig.id === 'podium') {
            if (hasThirdPlaceTie) {
                // Przy remisie: krok 2=historia 1. z remisu, 3=historia 2. z remisu, 6=historia 2., 9=historia 1.
                if (currentStep === 2 && sortedStats[2]) playerToShow = sortedStats[2].nickname;
                else if (currentStep === 3 && sortedStats[3]) playerToShow = sortedStats[3].nickname;
                else if (currentStep === 6 && sortedStats[1]) playerToShow = sortedStats[1].nickname;
                else if (currentStep === 9 && sortedStats[0]) playerToShow = sortedStats[0].nickname;
            } else {
                // Normalnie: krok 2=historia 3., 5=historia 2., 8=historia 1.
                if (currentStep === 2 && sortedStats[2]) playerToShow = sortedStats[2].nickname;
                else if (currentStep === PODIUM_STANDARD_STEPS.secondPlaceHistory && sortedStats[1]) playerToShow = sortedStats[1].nickname;
                else if (currentStep === PODIUM_STANDARD_STEPS.firstPlaceHistory && sortedStats[0]) playerToShow = sortedStats[0].nickname;
            }
        } else if (currentSlideConfig.id === 'sigmas') {
            const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);
            const top1Sigma = topSigmas[0];
            const top1WasInTop3 = top3Nicknames.includes(top1Sigma?.nickname);

            if (!top1WasInTop3 && currentStep === 4 && top1Sigma) {
                playerToShow = top1Sigma.nickname;
            }
        } else if (currentSlideConfig.id === 'cwele') {
            const top3Nicknames = sortedStats.slice(0, 3).map(p => p.nickname);
            const top1Cwel = topCwele[0];
            const top1WasInTop3 = top3Nicknames.includes(top1Cwel?.nickname);

            if (!top1WasInTop3 && currentStep === 4 && top1Cwel) {
                playerToShow = top1Cwel.nickname;
            }
        }

        if (playerToShow) {
            const changes = playerRankingChangesCache[playerToShow];
            if (changes) {
                setPlayerRankingChanges(changes);
            } else {
                setPlayerRankingChanges({});
            }
        } else {
            // Wyczyść mapę jeśli nie wyświetlamy historii gracza
            setPlayerRankingChanges({});
        }
    }, [currentSlide, currentStep, weeklyStats, topPlayerGames, slides, topSigmas, topCwele, playerRankingChangesCache]);

    // Kroki animacji: 0=intro, 1=tytuł, 2=3.miejsce, 3=2.miejsce, 4=1.miejsce, 5=pozostałe miejsca
    // STARE: const maxSteps = weeklyStats.length > 0 ? (weeklyStats.length > 3 ? 5 : 4) : 1;

    const handleClick = useCallback(() => {
        handleNext();
    }, [handleNext]);

    const togglePresentationFullscreen = async () => {
        try {
            if (!isPresentationFullscreen) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch {
            // Fullscreen API may be unavailable or denied — ignore
        }
    };

    // Obsługa zmian stanu pełnego ekranu
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreenNow = !!document.fullscreenElement;
            
            // NIE PAUSUJ AUDIO PODCZAS WEJŚCIA DO FULLSCREEN!
            // Muzyka ma grać cały czas - tylko przy WYJŚCIU zatrzymujemy
            
            setIsPresentationFullscreen(isFullscreenNow);
            
            // Dodaj/usuń klasę CSS dla body żeby ukryć inne elementy
            if (isFullscreenNow) {
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                
                // Zatrzymaj muzykę TYLKO przy wyjściu z pełnego ekranu
                if (backgroundMusicRef.current) {
                    try {
                        backgroundMusicRef.current.pause();
                    } catch {
                        // Ignorujemy błędy przy zatrzymywaniu
                    }
                    
                    backgroundMusicRef.current.currentTime = 0;
                    backgroundMusicRef.current = null;
                    // NIE USTAWIAMY STATE - już niepotrzebny
                }
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
            
            // NIE CZYŚCIMY AUDIO TUTAJ - tylko przy unmount całego komponentu
            // Audio jest czyszczone przy wyjściu z fullscreen w handleFullscreenChange
        };
    }, [isPresentationFullscreen, handleNext]);
    // backgroundMusic usunięte z dependencies - używamy Ref w cleanup

    // useEffect do cleanup przy unmount komponentu
    useEffect(() => {
        return () => {
            if (backgroundMusicRef.current) {
                backgroundMusicRef.current.pause();
                backgroundMusicRef.current.currentTime = 0;
                backgroundMusicRef.current = null;
            }
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
            }
            pendingTimersRef.current.forEach(t => clearTimeout(t));
            pendingTimersRef.current = [];
        };
    }, []); // Puste dependencies - cleanup tylko przy unmount

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

    const isFullscreen = isPresentationFullscreen;

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
                    className="fixed inset-0 w-screen h-screen bg-black flex items-center justify-center overflow-hidden"
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
                    {/* Kontener 16:9 - stałe proporcje na każdym ekranie */}
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            maxWidth: '177.78vh', // 16:9 aspect ratio based on height
                            maxHeight: '56.25vw',  // 16:9 aspect ratio based on width
                            aspectRatio: '16/9',
                            backgroundColor: 'black'
                        }}
                        className="text-white cursor-pointer select-none"
                    >
                        {/* Zawartość prezentacji - tylko tryb pełnoekranowy (inlined renderPresentationContent) */}
                        <>
                            {/* YouTube video - odtwarzanie z wyciszonym dźwiękiem (tylko obraz) - ładowane od początku */}
                            <div className="absolute inset-0 overflow-hidden" style={{ opacity: 1 }}>
                                <iframe
                                    src="https://www.youtube-nocookie.com/embed/6BFhVrifW-0?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&start=0&playlist=6BFhVrifW-0&volume=0"
                                    className="absolute inset-0"
                                    style={{
                                        width: '100%',
                                        height: '56.25%',
                                        minHeight: '100%',
                                        minWidth: '177.78%',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        pointerEvents: 'none',
                                        border: 'none',
                                        opacity: 1,
                                        filter: 'none'
                                    }}
                                    frameBorder="0"
                                     title="Wideo w tle Among Us"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                />
                            </div>

                            {/* Confetti Effect */}
                            {showConfetti && (
                                <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                                    {confettiPieces.map((piece, i) => (
                                        <div
                                            key={i}
                                            className="absolute"
                                            style={{
                                                left: `${piece.left}%`,
                                                top: '-10%',
                                                width: '10px',
                                                height: '10px',
                                                backgroundColor: piece.color,
                                                animation: `confettiFall ${piece.duration}s linear forwards`,
                                                animationDelay: `${piece.delay}s`,
                                                transform: `rotate(${piece.rotation}deg)`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* SLAJD 0: Intro z czarną warstwą na górze */}
                            {slides[currentSlide]?.id === 'intro' && (
                                <>
                                    <div 
                                        className="absolute inset-0"
                                        style={{
                                            opacity: isTransitioning ? 0 : 1,
                                            transition: 'opacity 1s ease-out', // 1 sekunda fade out dla intro
                                            zIndex: isTransitioning ? 20 : 10 // Intro na górze podczas fade out
                                        }}
                                    >
                                        <IntroSlide
                                            isFullscreen={isFullscreen}
                                            currentStep={currentStep}
                                            introInitialDelayPassed={introInitialDelayPassed}
                                            randomAvatars={randomAvatars}
                                        />
                                    </div>
                                    
                                    {/* Czarna warstwa na samej górze - znika po pierwszym kliknięciu */}
                                    <div 
                                        className="absolute inset-0 bg-black"
                                        style={{
                                            opacity: introBlackOverlay ? 1 : 0,
                                            transition: 'opacity 0.5s ease-out',
                                            zIndex: 100,
                                            pointerEvents: introBlackOverlay ? 'auto' : 'none'
                                        }}
                                    />
                                </>
                            )}

                            {/* SLAJD: Ankieta Emperor (jeśli istnieje) - natychmiast widoczny pod intro */}
                            {(slides[currentSlide]?.id === 'emperor-poll' || (isTransitioning && slides[currentSlide]?.id === 'intro' && slides[currentSlide + 1]?.id === 'emperor-poll')) && (
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        opacity: 1,
                                        zIndex: 5
                                    }}
                                >
                                    {/* Podczas fadeoutu intro pokazujemy krok 0 (pytanie), potem normalne kroki */}
                                    <EmperorPollSlide
                                        isFullscreen={isFullscreen}
                                        step={(isTransitioning && slides[currentSlide]?.id === 'intro') ? 0 : currentStep}
                                        emperorPoll={emperorPoll!}
                                    />
                                </div>
                            )}

                            {/* SLAJD: Pozostali gracze (jeśli istnieją) - natychmiast widoczny pod intro */}
                            {(slides[currentSlide]?.id === 'remaining' || (isTransitioning && slides[currentSlide]?.id === 'intro' && slides[currentSlide + 1]?.id === 'remaining')) && (
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        opacity: slides[currentSlide]?.id === 'remaining' ? (isTransitioning ? 0 : 1) : 1,
                                        transition: slides[currentSlide]?.id === 'remaining' && isTransitioning ? 'opacity 0.5s ease-out' : 'none',
                                        zIndex: 5
                                    }}
                                >
                                    {/* Podczas fadeoutu intro pokazujemy krok 0 (napis "PODSUMOWANIE..."), potem normalne kroki */}
                                    <RemainingPlayersSlide
                                        isFullscreen={isFullscreen}
                                        weeklyStats={weeklyStats}
                                        step={(isTransitioning && slides[currentSlide]?.id === 'intro') ? 0 : currentStep}
                                    />
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
                                    <PodiumSlide
                                        isFullscreen={isFullscreen}
                                        weeklyStats={weeklyStats}
                                        topPlayerGames={topPlayerGames}
                                        playerRankingChanges={playerRankingChanges}
                                        date={date}
                                        currentStep={currentStep}
                                    />
                                </div>
                            )}

                            {/* SLAJD: Największe Sigmy */}
                            {slides[currentSlide]?.id === 'sigmas' && (
                                <SigmasSlide
                                    isFullscreen={isFullscreen}
                                    currentStep={currentStep}
                                    isTransitioning={isTransitioning}
                                    topSigmas={topSigmas}
                                    weeklyStats={weeklyStats}
                                    sigmaRankingHistory={sigmaRankingHistory}
                                    topPlayerGames={topPlayerGames}
                                    playerRankingChanges={playerRankingChanges}
                                    date={date}
                                />
                            )}

                            {/* SLAJD: Największe Cwele */}
                            {slides[currentSlide]?.id === 'cwele' && (
                                <CweleSlide
                                    isFullscreen={isFullscreen}
                                    currentStep={currentStep}
                                    isTransitioning={isTransitioning}
                                    topCwele={topCwele}
                                    weeklyStats={weeklyStats}
                                    cwelRankingHistory={cwelRankingHistory}
                                    topPlayerGames={topPlayerGames}
                                    playerRankingChanges={playerRankingChanges}
                                    date={date}
                                />
                            )}

                            {/* SLAJD: Historia Emperorów */}
                            {slides[currentSlide]?.id === 'emperor-history' && (
                                <EmperorHistorySlide
                                    isFullscreen={isFullscreen}
                                    currentStep={currentStep}
                                    isTransitioning={isTransitioning}
                                    emperorHistory={emperorHistory}
                                />
                            )}

                            {/* SLAJD: Ranking po sesji */}
                            {slides[currentSlide]?.id === 'final-ranking' && (
                                <FinalRankingSlide
                                    isFullscreen={isFullscreen}
                                    currentStep={currentStep}
                                    rankingAfterSession={rankingAfterSession}
                                    weeklyStats={weeklyStats}
                                    date={date}
                                />
                            )}
                        </>
                    </div>
                </div>,
                document.body // Renderuje bezpośrednio w body, poza layout Next.js
            )}

        </>
    );
}
