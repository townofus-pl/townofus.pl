"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { useParams } from "next/navigation";
import localFont from "next/font/local";
import type { UIGameData } from '@/data/games/converter';

// Import czcionki videotext
const videotext = localFont({
    src: '../../../_fonts/Videotext.ttf',
    display: 'swap',
    variable: '--font-videotext',
});

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

// Typy dla sigm tygodnia
interface SigmaPlayer {
    nickname: string;
    rankBefore: number;
    rankAfter: number;
    ratingBefore: number;
    ratingAfter: number;
    change: number;
    ratingChange: number;
}

interface RankingHistoryPoint {
    date: Date;
    rating: number;
    position: number;
}

interface EmperorHistoryEntry {
    nickname: string;
    count: number;
    dates: string[];
    isLatest: boolean;
}

interface PlayerRankingAfterSession {
    nickname: string;
    rating: number;
    position: number;
    ratingChange: number;
}

export default function WeeklySummaryPage() {
    const params = useParams();
    const date = params?.date as string;
    
    const [currentSlide, setCurrentSlide] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
    const [weeklyStats, setWeeklyStats] = useState<WeeklyPlayerStats[]>([]);
    const [emperorPoll, setEmperorPoll] = useState<EmperorPoll | null>(null);
    const [topSigmas, setTopSigmas] = useState<SigmaPlayer[]>([]);
    const [sigmaRankingHistory, setSigmaRankingHistory] = useState<Map<string, RankingHistoryPoint[]>>(new Map());
    const [topCwele, setTopCwele] = useState<SigmaPlayer[]>([]);
    const [cwelRankingHistory, setCwelRankingHistory] = useState<Map<string, RankingHistoryPoint[]>>(new Map());
    const [emperorHistory, setEmperorHistory] = useState<EmperorHistoryEntry[]>([]);
    const [rankingAfterSession, setRankingAfterSession] = useState<PlayerRankingAfterSession[]>([]);
    const [topPlayerGames, setTopPlayerGames] = useState<UIGameData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [introBlackOverlay, setIntroBlackOverlay] = useState(true);
    const backgroundMusicRef = useRef<HTMLAudioElement | null>(null); // Ref zamiast state - nie triggeruje re-render
    const [introInitialDelayPassed, setIntroInitialDelayPassed] = useState(false); // Czy minęło początkowe opóźnienie intro
    const [isVideoPlaying, _setIsVideoPlaying] = useState(false); // Czy film mamika jest odtwarzany
    
    // Hooki dla filmu mamika (muszą być zawsze, nawet jeśli nie są używane)
    const [_videoOpacity, setVideoOpacity] = useState(1);
    const videoRef = useRef<HTMLVideoElement>(null);

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

    // Oblicz liczbę graczy do odkrycia (od ostatniego do 4. miejsca)
    const remainingPlayersCount = Math.max(0, weeklyStats.length - 3);
    
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
            steps: 9 // Krok 0: pusty, Krok 1: 3. miejsce, Krok 2: historia 3., Krok 3: powrót, Krok 4: 2. miejsce, Krok 5: historia 2., Krok 6: powrót, Krok 7: 1. miejsce, Krok 8: historia 1. -> przejście dalej
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
    ], [emperorPoll, remainingPlayersCount, topSigmas.length, topCwele.length, emperorHistory.length, rankingAfterSession.length, weeklyStats.length]);

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
    }, [currentSlide, currentStep, introBlackOverlay, isPresentationFullscreen, introInitialDelayPassed, slides]);

    // Obsługa fadeout dla filmu mamika (dla daty 20251203)
    useEffect(() => {
        const video = videoRef.current;
        if (!video || date !== '20251203' || currentSlide !== slides.findIndex(s => s.id === 'podium') || currentStep !== 2) {
            return;
        }
        
        const handleTimeUpdate = () => {
            const timeRemaining = video.duration - video.currentTime;
            // Rozpocznij fadeout 1 sekundę przed końcem
            if (timeRemaining <= 1 && timeRemaining > 0) {
                setVideoOpacity(timeRemaining);
            }
        };
        
        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [date, currentSlide, currentStep, slides]);

    // Funkcja do przejścia do kolejnego kroku/slajdu
    const handleNext = useCallback(() => {
        const currentSlideConfig = slides[currentSlide];
        
        // Specjalna obsługa pierwszego slajdu intro - usuń czarną warstwę i uruchom muzykę
        // UWAGA: Kroki 0-6 są automatyczne, nie reagują na kliknięcie
        if (currentSlideConfig.id === 'intro' && introBlackOverlay) {
            setIntroBlackOverlay(false);
            
            // Uruchom muzykę w tle - używamy Ref zamiast state żeby uniknąć cleanup
            // Muzyka uruchamia się PO kliknięciu, więc przeglądarka już nie blokuje autoplay
            if (!backgroundMusicRef.current) {
                console.log('🎵 Tworzę nowy obiekt Audio...');
                const audio = new Audio('/sounds/among us DRAMA AFERA.mp3');
                audio.loop = true;
                audio.volume = 1.0; // Pełna głośność
                
                console.log('🎵 Audio stworzone:', audio.src);
                console.log('🎵 Volume ustawione na:', audio.volume);
                console.log('🎵 Loop ustawiony na:', audio.loop);
                
                // Dodaj event listenery dla debugowania
                audio.addEventListener('loadstart', () => console.log('🔄 Audio: loadstart'));
                audio.addEventListener('loadedmetadata', () => console.log('📊 Audio: loadedmetadata'));
                audio.addEventListener('canplay', () => console.log('✅ Audio: canplay'));
                audio.addEventListener('playing', () => console.log('▶️ Audio: playing'));
                audio.addEventListener('pause', () => {
                    console.log('⏸️ Audio: pause');
                    console.trace('⏸️ PAUSE WYWOŁANE - STACK TRACE:');
                });
                audio.addEventListener('ended', () => console.log('🛑 Audio: ended'));
                audio.addEventListener('error', (e) => console.error('❌ Audio error:', e));
                
                // Zapisz audio NAJPIERW, potem play
                backgroundMusicRef.current = audio;
                
                // Opóźniamy play() o 100ms żeby przeglądarka nie myślała że to autoplay
                console.log('🎵 Wywołuję audio.play() za 100ms...');
                setTimeout(() => {
                    audio.play()
                        .then(() => {
                            console.log('✅ audio.play() Promise RESOLVED - muzyka powinna grać!');
                            console.log('🎵 Aktualny czas:', audio.currentTime);
                            console.log('🎵 Czy paused?:', audio.paused);
                            console.log('🎵 Volume:', audio.volume);
                        })
                        .catch(err => {
                            console.error('❌ audio.play() Promise REJECTED:', err);
                            console.error('❌ Błąd:', err.message);
                        });
                }, 100);
                // NIE USTAWIAMY STATE - tylko Ref! State triggeruje re-render i cleanup
                console.log('🎵 Audio zapisane w Ref (BEZ setState)');
            } else {
                console.log('⚠️ Audio już istnieje w Ref!');
            }
            
            return;
        }
        
        // Jeśli są jeszcze kroki w bieżącym slajdzie
        if (currentStep < currentSlideConfig.steps - 1) {
            // Sprawdź czy to odkrycie 1. miejsca na podium
            // Dla 20251203: krok 2->3 (film->2.i1.razem), dla innych: krok 2->3 (2.->1.)
            if (currentSlideConfig.id === 'podium' && currentStep === 6) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 5000); // Confetti przez 5 sekund
            }
            // Dla 20251203: confetti przy odkryciu 2. i 1. miejsca razem (krok 3)
            if (currentSlideConfig.id === 'podium' && currentStep === 2) {
                // Krok 2->3 dla 20251203 to po filmie, ale confetti dopiero w następnym kroku
                // Nie ustawiamy tutaj, bo krok 2 to film który sam przejdzie dalej
            }
            
            // Fade transition między sigmami, cwelami i emperor-history (każdy krok od kroku 0)
            if ((currentSlideConfig.id === 'sigmas' || currentSlideConfig.id === 'cwele' || currentSlideConfig.id === 'emperor-history') && currentStep >= 0) {
                setIsTransitioning(true);
                setTimeout(() => {
                    setCurrentStep(currentStep + 1);
                    setTimeout(() => setIsTransitioning(false), 100);
                }, 500);
            } else {
                setCurrentStep(currentStep + 1);
            }
        } 
        // Jeśli to ostatni krok w slajdzie, przejdź do następnego slajdu
        else if (currentSlide < totalSlides - 1) {
            const nextSlideConfig = slides[currentSlide + 1];
            
            console.log('🔍 DEBUG: currentSlide=', currentSlide, 'currentSlideId=', currentSlideConfig.id, 'hasAudio=', !!backgroundMusicRef.current);
            
            // Ścisz muzykę po przejściu z intro (teraz już audio istnieje!) - płynne przejście
            if (currentSlideConfig.id === 'intro' && backgroundMusicRef.current) {
                console.log('🔉 PRZED ściszeniem - volume:', backgroundMusicRef.current.volume);
                
                const audio = backgroundMusicRef.current;
                const startVolume = audio.volume;
                const targetVolume = 0.15; // 13% głośności
                const fadeDuration = 1000; // 1 sekunda
                const fadeSteps = 50; // 50 kroków
                const stepDuration = fadeDuration / fadeSteps;
                const volumeStep = (startVolume - targetVolume) / fadeSteps;
                
                let currentStep = 0;
                const fadeInterval = setInterval(() => {
                    currentStep++;
                    const newVolume = startVolume - (volumeStep * currentStep);
                    
                    if (currentStep >= fadeSteps || newVolume <= targetVolume) {
                        audio.volume = targetVolume;
                        clearInterval(fadeInterval);
                        console.log('🔉 PO ściszeniu - volume:', audio.volume);
                    } else {
                        audio.volume = newVolume;
                    }
                }, stepDuration);
            } else if (currentSlideConfig.id === 'intro') {
                console.log('⚠️ Intro ale brak audio w Ref!');
            } else {
                console.log('⚠️ Nie intro, pomijam ściszenie. SlideId:', currentSlideConfig.id);
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
                
                setTimeout(() => {
                    setCurrentSlide(currentSlide + 1);
                    setCurrentStep(0);
                    setTimeout(() => setIsTransitioning(false), 100);
                }, transitionDelay);
            } else {
                setCurrentSlide(currentSlide + 1);
                setCurrentStep(0);
            }
        }
        // Jeśli to ostatni slajd i ostatni krok, zresetuj
        else {
            console.log('🔴 RESET PREZENTACJI - zatrzymuję muzykę');
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
    }, [currentSlide, currentStep, slides, totalSlides, introBlackOverlay]);
    // backgroundMusic usunięte z dependencies - używamy tylko Ref!

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
                } catch {
                    // Ankieta opcjonalna - brak pliku nie jest błędem
                    console.log('No emperor poll found for this date');
                }
                
                // Pobierz największe sigmy tygodnia (opcjonalne)
                try {
                    const sigmasResponse = await fetch(`/api/dramaafera/top-sigmas/${date}`);
                    if (sigmasResponse.ok) {
                        const sigmasData = await sigmasResponse.json() as { success: boolean; data?: SigmaPlayer[] };
                        if (sigmasData.success && sigmasData.data) {
                            const topThree: SigmaPlayer[] = sigmasData.data.slice(0, 3);
                            setTopSigmas(topThree);
                            
                            // Pobierz historię rankingu dla każdej sigmy
                            const historyMap = new Map<string, RankingHistoryPoint[]>();
                            for (const sigma of topThree) {
                                try {
                                    const historyResponse = await fetch(`/api/dramaafera/ranking-history/${sigma.nickname}`);
                                    if (historyResponse.ok) {
                                        const historyData = await historyResponse.json() as { success: boolean; data?: { date: string; rating: number; position: number }[] };
                                        if (historyData.success && historyData.data) {
                                            historyMap.set(sigma.nickname, historyData.data.map((point) => ({
                                                date: new Date(point.date),
                                                rating: point.rating,
                                                position: point.position
                                            })));
                                        }
                                    }
                                } catch {
                                    console.log(`No ranking history for ${sigma.nickname}`);
                                }
                            }
                            setSigmaRankingHistory(historyMap);
                        }
                    }
                } catch {
                    // Sigmy opcjonalne - brak danych nie jest błędem
                    console.log('No sigmas data found for this date');
                }
                
                // Pobierz dane o cwelich (gracze z największym spadkiem)
                try {
                    const cweleResponse = await fetch(`/api/dramaafera/top-sigmas/${date}`);
                    if (cweleResponse.ok) {
                        const cweleData = await cweleResponse.json() as { success: boolean; data?: SigmaPlayer[] };
                        
                        if (cweleData.success && cweleData.data) {
                            // Weź 3 ostatnich (największe spadki - najbardziej ujemne ratingChange)
                            const bottomPlayers: SigmaPlayer[] = cweleData.data.slice(-3).reverse();
                            setTopCwele(bottomPlayers);
                            
                            // Pobierz historię rankingu dla każdego cwela
                            const historyMap = new Map<string, RankingHistoryPoint[]>();
                            for (const cwel of bottomPlayers) {
                                try {
                                    const historyResponse = await fetch(`/api/dramaafera/ranking-history/${cwel.nickname}`);
                                    if (historyResponse.ok) {
                                        const historyData = await historyResponse.json() as { success: boolean; data?: { date: string; rating: number; position: number }[] };
                                        if (historyData.success && historyData.data) {
                                            historyMap.set(cwel.nickname, historyData.data.map((point) => ({
                                                date: new Date(point.date),
                                                rating: point.rating,
                                                position: point.position
                                            })));
                                        }
                                    }
                                } catch {
                                    console.log(`No ranking history for ${cwel.nickname}`);
                                }
                            }
                            setCwelRankingHistory(historyMap);
                        }
                    }
                } catch {
                    // Cwele opcjonalne - brak danych nie jest błędem
                    console.log('No cwele data found for this date');
                }
                
                // Pobierz historię Emperorów
                try {
                    const emperorHistoryResponse = await fetch('/api/dramaafera/emperor-history');
                    if (emperorHistoryResponse.ok) {
                        const emperorHistoryData = await emperorHistoryResponse.json() as { success: boolean; data?: EmperorHistoryEntry[] };
                        if (emperorHistoryData.success && emperorHistoryData.data) {
                            setEmperorHistory(emperorHistoryData.data);
                        }
                    }
                } catch {
                    console.log('No emperor history found');
                }
                
                // Pobierz ranking po sesji
                try {
                    const rankingResponse = await fetch(`/api/dramaafera/ranking-after-session/${date}`);
                    console.log('Ranking response status:', rankingResponse.status);
                    if (rankingResponse.ok) {
                        const rankingData = await rankingResponse.json() as { success: boolean; data?: PlayerRankingAfterSession[] };
                        console.log('Ranking data:', rankingData);
                        if (rankingData.success && rankingData.data) {
                            console.log('Setting ranking, count:', rankingData.data.length);
                            setRankingAfterSession(rankingData.data);
                        }
                    }
                } catch (rankingErr) {
                    console.log('Ranking error:', rankingErr);
                }
                
                // Pobierz dane o grach TOP1 gracza
                try {
                    if (statsData.data && statsData.data.players.length > 0) {
                        const topPlayer = [...statsData.data.players].sort((a, b) => b.totalPoints - a.totalPoints)[0];
                        console.log('Top player:', topPlayer.nickname);
                        
                        // Pobierz szczegóły gier z tego dnia
                        const gamesResponse = await fetch(`/api/games/by-date?date=${date}`);
                        if (gamesResponse.ok) {
                            const gamesData = await gamesResponse.json() as { success: boolean; data?: { detailedGames: UIGameData[] } };
                            if (gamesData.success && gamesData.data?.detailedGames) {
                                const playerGames = gamesData.data.detailedGames;
                                console.log('Games for top player:', playerGames.length);
                                setTopPlayerGames(playerGames);
                            }
                        }
                    }
                } catch (topPlayerErr) {
                    console.log('Top player games error:', topPlayerErr);
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
        // Blokuj kliknięcia podczas odtwarzania filmu
        if (isVideoPlaying) {
            return;
        }
        handleNext();
    }, [handleNext, isVideoPlaying]);

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
            
            console.log('🖥️ Fullscreen change:', { isFullscreenNow, hasAudio: !!backgroundMusicRef.current });
            
            // NIE PAUSUJ AUDIO PODCZAS WEJŚCIA DO FULLSCREEN!
            // Muzyka ma grać cały czas - tylko przy WYJŚCIU zatrzymujemy
            
            setIsPresentationFullscreen(isFullscreenNow);
            
            // Dodaj/usuń klasę CSS dla body żeby ukryć inne elementy
            if (isFullscreenNow) {
                document.body.style.overflow = 'hidden';
                document.documentElement.style.overflow = 'hidden';
                console.log('✅ Wejście w fullscreen - muzyka gra dalej');
            } else {
                document.body.style.overflow = '';
                document.documentElement.style.overflow = '';
                
                // Zatrzymaj muzykę TYLKO przy wyjściu z pełnego ekranu
                console.log('🔴 WYJŚCIE Z FULLSCREEN - zatrzymuję muzykę');
                console.log('🔴 Audio exists?', !!backgroundMusicRef.current);
                if (backgroundMusicRef.current) {
                    console.log('🔴 Audio paused przed:', backgroundMusicRef.current.paused);
                    console.log('🔴 Audio currentTime przed:', backgroundMusicRef.current.currentTime);
                    
                    try {
                        backgroundMusicRef.current.pause();
                        console.log('🔴 pause() wywołane!');
                    } catch (e) {
                        console.error('🔴 Błąd przy pause():', e);
                    }
                    
                    backgroundMusicRef.current.currentTime = 0;
                    backgroundMusicRef.current = null;
                    console.log('🔴 Audio wyczyszczone!');
                    // NIE USTAWIAMY STATE - już niepotrzebny
                } else {
                    console.log('🔴 Audio Ref jest null - muzyka już zatrzymana?');
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
            console.log('🧹 UNMOUNT KOMPONENTU - cleanup audio');
            if (backgroundMusicRef.current) {
                backgroundMusicRef.current.pause();
                backgroundMusicRef.current.currentTime = 0;
                backgroundMusicRef.current = null;
            }
        };
    }, []); // Puste dependencies - cleanup tylko przy unmount

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
                        {/* Zawartość prezentacji - tylko tryb pełnoekranowy */}
                        {renderPresentationContent(true)}
                    </div>
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
                
                @keyframes glow {
                    0% {
                        text-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(239, 68, 68, 0.6), 0 0 60px rgba(239, 68, 68, 0.4);
                    }
                    100% {
                        text-shadow: 0 0 30px rgba(239, 68, 68, 1), 0 0 60px rgba(239, 68, 68, 0.8), 0 0 90px rgba(239, 68, 68, 0.6);
                    }
                }
                
                @keyframes slideInLeft {
                    from {
                        opacity: 0;
                        transform: translateX(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                @keyframes pulseShadow {
                    0%, 100% {
                        filter: drop-shadow(0 0 10px rgba(239, 68, 68, 0.8));
                    }
                    50% {
                        filter: drop-shadow(0 0 10px rgba(245, 148, 148, 1));
                    }
                }
            `}</style>
        </>
    );

    // Funkcja renderująca zawartość prezentacji
    function renderPresentationContent(isFullscreen: boolean) {
        return (
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
                        allow=""
                        allowFullScreen
                    />
                </div>



                {/* Confetti Effect */}
                {showConfetti && (
                    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
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
                            {renderIntroSlide(isFullscreen)}
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
                        {renderEmperorPollSlide(isFullscreen, (isTransitioning && slides[currentSlide]?.id === 'intro') ? 0 : currentStep)}
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
                        {renderRemainingPlayersSlide(isFullscreen, (isTransitioning && slides[currentSlide]?.id === 'intro') ? 0 : currentStep)}
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

                {/* SLAJD: Największe Sigmy */}
                {slides[currentSlide]?.id === 'sigmas' && renderSigmasSlide(isFullscreen)}

                {/* SLAJD: Największe Cwele */}
                {slides[currentSlide]?.id === 'cwele' && renderCweleSlide(isFullscreen)}

                {/* SLAJD: Historia Emperorów */}
                {slides[currentSlide]?.id === 'emperor-history' && renderEmperorHistorySlide(isFullscreen)}

                {/* SLAJD: Ranking po sesji */}
                {slides[currentSlide]?.id === 'final-ranking' && renderFinalRankingSlide(isFullscreen)}
            </>
        );
    }

    // SLAJD 0: Intro slide
    function renderIntroSlide(isFullscreen: boolean) {
        // Tablica tekstów dla kroków 0-6 (automatyczna sekwencja)
        const introTexts = ['A', 'AMONG', 'US', 'DRA', 'DRAMA', 'A', 'AFE'];
        
        // ZAWSZE renderuj finalne intro (z logo) na dole jako bazę
        const finalIntroContent = renderFinalIntro(isFullscreen);
        
        // Kroki 0-6: OGROMNE teksty (placeholdery) - wyświetlane NA WIERZCHU finalnego intro
        if (currentStep >= 0 && currentStep < 7) {
            return (
                <>
                    {/* Finalne intro zawsze załadowane pod spodem (z-index: 1) */}
                    <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
                        {finalIntroContent}
                    </div>
                    
                    {/* Czarne tło przykrywające intro + teksty na wierzchu (z-index: 10) */}
                    <div 
                        className="absolute inset-0 bg-black flex items-center justify-center"
                        style={{ zIndex: 10 }}
                    >
                        {/* Pokaż tekst tylko gdy minęło początkowe opóźnienie */}
                        {introInitialDelayPassed && (
                            <h1 
                                className={`${videotext.className} font-bold ${isFullscreen ? 'text-[20rem]' : 'text-9xl'}`}
                                style={{
                                    color: 'rgb(240, 194, 42)',
                                    textShadow: '0 0 60px rgba(204, 169, 56, 0.8)',
                                    animation: 'fadeIn 0.5s ease-in',
                                    letterSpacing: isFullscreen ? '-0.11em' : '-0.05em'
                                }}
                            >
                                {introTexts[currentStep]}
                            </h1>
                        )}
                    </div>
                </>
            );
        }
        
        // Krok 7: Samo finalne intro (teksty już znikły)
        return finalIntroContent;
    }
    
    // Funkcja renderująca finalne intro z logo
    function renderFinalIntro(isFullscreen: boolean) {
        // Jeśli nie ma jeszcze wygenerowanych avatarów, nie renderuj tła
        if (randomAvatars.length === 0) {
            return (
                <div className="relative flex items-center justify-center h-full overflow-hidden">
                    {/* Główna zawartość intro bez tła */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Image
                            src="/images/DAXD.png"
                            alt="Drama Afera Intro"
                            width={isFullscreen ? 2000 : 700}
                            height={isFullscreen ? 2000 : 700}
                            className="drop-shadow-2xl transition-all duration-1000 ease-out opacity-100 scale-100"
                        />
                    </div>
                    <p 
                        className={`text-amber-200 font-medium tracking-wider absolute left-1/2 top-1/2 -translate-x-1/2 z-30 text-center whitespace-nowrap ${isFullscreen ? 'text-4xl' : 'text-lg'}`}
                        style={{ marginTop: '-110px' }}
                    >
                        POWERED BY ZIOMSON & MALKIZ
                    </p>
                </div>
            );
        }
        
        return (
            <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
                {/* Animowane tło z avatarami - tylko graczy z tego tygodnia */}
                <div className="absolute inset-0 overflow-hidden">
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
                                            {/* Szare tło pod avatarem (wypełnia przezroczystość) */}
                                            <div className="absolute inset-0" style={{ backgroundColor: '#303030' }}></div>
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
                    <div 
                        className="absolute inset-0 mix-blend-multiply" 
                        style={{ 
                            backgroundColor: 'rgba(87, 34, 25, 1)',
                            opacity: 0.9 
                        }}
                    ></div>
                </div>

                {/* Główna zawartość intro */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <Image
                        src="/images/DAXD.png"
                        alt="Drama Afera Intro"
                        width={isFullscreen ? 1800 : 700}
                        height={isFullscreen ? 1800 : 700}
                        className="drop-shadow-2xl transition-all duration-1000 ease-out opacity-100 scale-100"
                    />
                </div>
                <p 
                    className={`${videotext.className} text-amber-200 font-medium tracking-wider absolute left-1/2 top-1/2 -translate-x-1/2 z-30 text-center whitespace-nowrap ${isFullscreen ? 'text-4xl' : 'text-lg'}`}
                    style={{ marginTop: '420px', letterSpacing: '-0.02em' }}
                >
                    POWERED BY ZIOMSON & MALKIZ
                </p>
            </div>
        );
    }

    // SLAJD: Ankieta Emperor
    function renderEmperorPollSlide(isFullscreen: boolean, step: number = currentStep) {
        if (!emperorPoll) return null;

        // Krok 0: Pytanie
        if (step === 0) {
            return (
                <div className="relative flex items-center justify-center h-full">
                    <div className="text-center px-8">
                        <h1 
                            className={`${videotext.className} font-bold leading-tight ${isFullscreen ? 'text-9xl' : 'text-5xl'}`}
                            style={{
                                color: 'rgba(226, 185, 49, 1)',
                                textShadow: '0 0 20px rgba(194, 165, 69, 0.5)',
                                letterSpacing: isFullscreen ? '-0.05em' : '-0.02em'
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
                    <h2 
                        className={`${videotext.className} font-bold mb-8 ${isFullscreen ? 'text-9xl' : 'text-4xl'}`}
                        style={{ 
                            color: 'rgba(245, 216, 122, 1)',
                            letterSpacing: isFullscreen ? '-0.05em' : '-0.02em'
                        }}
                    >
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
                                        <div 
                                            className={`font-bold ${isFullscreen ? 'text-3xl' : 'text-xl'}`}
                                            style={{ color: 'rgba(245, 216, 122, 1)' }}
                                        >
                                            {vote.votes}
                                        </div>
                                        <div 
                                            className={`font-bold ${isFullscreen ? 'text-2xl' : 'text-lg'}`}
                                            style={{ color: 'rgba(245, 216, 122, 1)' }}
                                        >
                                            {percentage}%
                                        </div>
                                    </div>

                                    {/* Słupek */}
                                    <div 
                                        className="relative w-full shadow-xl"
                                        style={{ 
                                            height: `${barHeight}px`,
                                            opacity: 0,
                                            animation: `slideUpBar 0.8s ease-out ${index * 0.1}s forwards`,
                                            backgroundColor: 'rgba(245, 216, 122, 1)'
                                        }}
                                    >
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
                                            className="relative overflow-hidden"
                                            style={{ 
                                                width: `${avatarSize}px`, 
                                                height: `${avatarSize}px`,
                                                border: '3px solid rgba(245, 216, 122, 1)',
                                                backgroundColor: 'rgba(0, 0, 0, 0.6)'
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
                                            {/* Warstwa wewnętrznego cienia */}
                                            <div 
                                                className="absolute inset-0 pointer-events-none"
                                                style={{
                                                    boxShadow: 'inset 0 0 20px rgba(197, 176, 98, 0.3), inset 0 0 10px rgba(207, 178, 72, 0.2)'
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

    // Funkcja pomocnicza do renderowania historii gier dla dowolnego gracza
    function renderPlayerHistory(nickname: string, isFullscreen: boolean) {
        if (topPlayerGames.length === 0) return null;

        // Filtruj tylko gry tego gracza
        const playerGamesDetails = topPlayerGames.map(game => {
            const playerData = game.detailedStats.playersData.find(p => p.nickname === nickname);
            return {
                game,
                playerData,
                played: !!playerData
            };
        });

        // Rozmiar kwadratów
        const squareSize = isFullscreen ? 160 : 80;
        const gap = isFullscreen ? 16 : 12;

        return (
            <div 
                className="absolute inset-0 flex flex-col items-center justify-center px-8 z-50"
                style={{
                    opacity: 1
                }}
            >
                {/* Tytuł - nick gracza */}
                <h1 
                    className={`${videotext.className} font-bold text-amber-400 mb-4 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(251, 191, 36, 0.7)',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {nickname}
                </h1>

                {/* Podtytuł - data */}
                <p className={`${videotext.className} text-amber-200 mb-12 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`} style={{ letterSpacing: '-0.02em' }}>
                    RUNDY Z {formatDate(date)}
                </p>

                {/* Grid z grami - dzielone na rzędy po 10 */}
                <div className="flex flex-col items-center" style={{ gap: `${gap}px` }}>
                    {Array.from({ length: Math.ceil(playerGamesDetails.length / 10) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 10;
                        const endIdx = Math.min(startIdx + 10, playerGamesDetails.length);
                        const rowGames = playerGamesDetails.slice(startIdx, endIdx);

                        return (
                            <div 
                                key={rowIndex}
                                className="flex justify-center"
                                style={{ gap: `${gap}px` }}
                            >
                                {rowGames.map((gameDetail, index) => {
                                    const { playerData, played } = gameDetail;
                                    const won = playerData?.win || false;
                                    const actualIndex = startIdx + index;

                                    return (
                                        <div key={actualIndex} className="flex flex-col items-center">
                                {/* Kwadrat z grą */}
                                <div
                                    className="relative"
                                    style={{
                                        width: `${squareSize}px`,
                                        height: `${squareSize}px`,
                                        border: played 
                                            ? (won ? '4px solid rgba(245, 216, 122, 1)' : '4px solid rgb(162, 17, 17)')
                                            : '4px solid rgb(61, 61, 61)',
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        boxShadow: played
                                            ? (won 
                                                ? 'inset 0 0 30px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                                : 'inset 0 0 30px rgba(105, 13, 13, 0.5), inset 0 0 25px rgba(182, 41, 41, 0.3)')
                                            : 'inset 0 0 30px rgba(61, 61, 61   , 0.5)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {played && playerData && (
                                        <Image
                                            src={`/images/roles/${playerData.role.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.png`}
                                            alt={playerData.role}
                                            width={squareSize}
                                            height={squareSize}
                                            className="object-contain scale-[1.3]"
                                            style={{ position: 'relative', zIndex: 10 }}
                                        />
                                    )}
                                </div>

                                {/* Statystyki pod kwadratem */}
                                {played && playerData && (
                                    <div className={`text-center mt-2 ${isFullscreen ? 'text-s' : 'text-xs'} leading-tight`}>
                                        {/* Kills */}
                                        {playerData.originalStats.correctKills > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctKills} CORRECT KILL{playerData.originalStats.correctKills > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectKills > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectKills} INCORRECT KILL{playerData.originalStats.incorrectKills > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Guesses */}
                                        {playerData.originalStats.correctGuesses > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctGuesses} CORRECT GUESS{playerData.originalStats.correctGuesses > 1 ? 'ES' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectGuesses > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectGuesses} INCORRECT GUESS{playerData.originalStats.incorrectGuesses > 1 ? 'ES' : ''}</div>
                                        )}
                                        
                                        {/* Medic Shields */}
                                        {playerData.originalStats.correctMedicShields > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctMedicShields} CORRECT SHIELD{playerData.originalStats.correctMedicShields > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectMedicShields > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectMedicShields} INCORRECT SHIELD{playerData.originalStats.incorrectMedicShields > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Warden Fortifies */}
                                        {playerData.originalStats.correctWardenFortifies > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctWardenFortifies} CORRECT FORTIF{playerData.originalStats.correctWardenFortifies > 1 ? 'IES' : 'Y'}</div>
                                        )}
                                        {playerData.originalStats.incorrectWardenFortifies > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectWardenFortifies} INCORRECT FORTIF{playerData.originalStats.incorrectWardenFortifies > 1 ? 'IES' : 'Y'}</div>
                                        )}
                                        
                                        {/* Jailor Executes */}
                                        {playerData.originalStats.correctJailorExecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctJailorExecutes} CORRECT EXECUTE{playerData.originalStats.correctJailorExecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectJailorExecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectJailorExecutes} INCORRECT EXECUTE{playerData.originalStats.incorrectJailorExecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Prosecutor Prosecutes */}
                                        {playerData.originalStats.correctProsecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctProsecutes} CORRECT PROSECUTE{playerData.originalStats.correctProsecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectProsecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectProsecutes} INCORRECT PROSECUTE{playerData.originalStats.incorrectProsecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Deputy Shoots */}
                                        {playerData.originalStats.correctDeputyShoots > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctDeputyShoots} CORRECT SHOT{playerData.originalStats.correctDeputyShoots > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectDeputyShoots > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectDeputyShoots} INCORRECT SHOT{playerData.originalStats.incorrectDeputyShoots > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Altruist Revives */}
                                        {playerData.originalStats.correctAltruistRevives > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctAltruistRevives} CORRECT REVIVE{playerData.originalStats.correctAltruistRevives > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectAltruistRevives > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectAltruistRevives} INCORRECT REVIVE{playerData.originalStats.incorrectAltruistRevives > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Swaps */}
                                        {playerData.originalStats.correctSwaps > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctSwaps} CORRECT SWAP{playerData.originalStats.correctSwaps > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectSwaps > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectSwaps} INCORRECT SWAP{playerData.originalStats.incorrectSwaps > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Janitor Cleans */}
                                        {playerData.originalStats.janitorCleans > 0 && (
                                            <div className="text-gray-400">{playerData.originalStats.janitorCleans} CLEAN{playerData.originalStats.janitorCleans > 1 ? 'S' : ''}</div>
                                        )}
                                    </div>
                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // SLAJD: Podium z krokami
    function renderPodiumSlide(isFullscreen: boolean) {
        // Sortuj według punktów DAP (malejąco) żeby mieć prawidłową TOP 3
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Określenie opacity podium na podstawie kroku (overlay histori gier)
        const showHistoryStep2 = currentStep === 2; // Historia 3. miejsca
        const showHistoryStep5 = currentStep === 5; // Historia 2. miejsca
        const showHistoryStep8 = currentStep === 8; // Historia 1. miejsca
        const podiumOpacity = (showHistoryStep2 || showHistoryStep5 || showHistoryStep8) ? 0 : 1;
        
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
                                            <Image
                                                src={`/images/avatars/${sortedStats[2].nickname}.png`}
                                                alt={sortedStats[2].nickname}
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2. miejsce - lewa pozycja - pokazuje się w kroku 4 */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '13.5%' : '12%', 
                            top: isFullscreen ? '24%' : '8%',
                            width: isFullscreen ? '260px' : '150px',
                            height: isFullscreen ? '260px' : '150px'
                        }}>
                            {/* Napisy nad avatarem - pokazują się po odkryciu */}
                            {currentStep >= 4 && sortedStats[1] && (
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
                                    currentStep >= 4 ? 'flip-card-flipped' : ''
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
                                            <Image
                                                src={`/images/avatars/${sortedStats[1].nickname}.png`}
                                                alt={sortedStats[1].nickname}
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
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 1. miejsce - środkowa pozycja (najwyższa) - pokazuje się w kroku 7 */}
                        <div className="absolute" style={{ 
                            left: isFullscreen ? '36.7%' : '42%', 
                            top: isFullscreen ? '-10%' : '2%',
                            width: isFullscreen ? '370px' : '105px',
                            height: isFullscreen ? '370px' : '105px'
                        }}>
                            {/* Napisy nad avatarem - EMPEROR, nick, DAP */}
                            {currentStep >= 7 && sortedStats[0] && (
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
                                    currentStep >= 7 ? 'flip-card-flipped' : ''
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
                                            <Image
                                                src={`/images/avatars/${sortedStats[0].nickname}.png`}
                                                alt={sortedStats[0].nickname}
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

                {/* Overlay z historią gier gracza 3. miejsca - krok 2 */}
                {currentStep === 2 && sortedStats[2] && topPlayerGames.length > 0 && renderPlayerHistory(sortedStats[2].nickname, isFullscreen)}

                {/* Overlay z historią gier gracza 2. miejsca - krok 5 */}
                {currentStep === 5 && sortedStats[1] && topPlayerGames.length > 0 && renderPlayerHistory(sortedStats[1].nickname, isFullscreen)}

                {/* Overlay z historią gier gracza 1. miejsca - krok 8 */}
                {currentStep === 8 && sortedStats[0] && topPlayerGames.length > 0 && renderPlayerHistory(sortedStats[0].nickname, isFullscreen)}
            </>
        );
    }

    // SLAJD: Pozostałe miejsca - prosta lista od dołu
    function renderRemainingPlayersSlide(isFullscreen: boolean, step: number = currentStep) {
        // Sortuj według punktów DAP (malejąco) - tak samo jak w hostinfo
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        
        // Gracze do odkrycia (od ostatniego miejsca do 4. miejsca)
        const playersToReveal = sortedStats.slice(3).reverse(); // Bierzemy od 4. miejsca w górę i odwracamy
        
        if (playersToReveal.length === 0) {
            return null;
        }

        // Lista WSZYSTKICH graczy (alfabetycznie) do pokazania po lewej stronie
        const allPlayersAlphabetically = [...weeklyStats].sort((a, b) => 
            a.nickname.toLowerCase().localeCompare(b.nickname.toLowerCase())
        );

        // Zbiór nicków graczy którzy zostali już odkryci (od kroku 1 w górę)
        const revealedNicknames = new Set<string>();
        if (step > 0) {
            // Dodaj odkrytych graczy (od najsłabszego do obecnie odkrytego)
            playersToReveal.slice(0, step).forEach(player => {
                revealedNicknames.add(player.nickname);
            });
        }

        // Liczba graczy do pokazania (step, bo krok 0 to napis)
        const visibleCount = step;

        // Określ liczbę kolumn - zawsze 2 kolumny gdy więcej niż 1 gracz
        const numberOfColumns = playersToReveal.length > 1 ? 2 : 1;
        const playersPerColumn = Math.ceil(playersToReveal.length / numberOfColumns);
        
        // Automatyczne skalowanie do wysokości ekranu - bazując na liczbie graczy w KOLUMNIE
        const maxPlayers = playersPerColumn; // Używamy liczby graczy w kolumnie, nie całkowitej
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
                    {/* Lista avatarów po lewej - widoczna od początku */}
                    <div className="absolute left-8 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                        {allPlayersAlphabetically.map(player => {
                            const isRevealed = revealedNicknames.has(player.nickname);
                            return (
                                <div 
                                    key={player.nickname}
                                    className="relative"
                                    style={{
                                        width: `${avatarSize}px`,
                                        height: `${avatarSize}px`,
                                        filter: isRevealed ? 'grayscale(100%)' : 'none',
                                        opacity: isRevealed ? 0.5 : 1,
                                        transition: 'filter 0.5s ease, opacity 0.5s ease'
                                    }}
                                >
                                    <Image
                                        src={`/images/avatars/${player.nickname}.png`}
                                        alt={player.nickname}
                                        width={avatarSize}
                                        height={avatarSize}
                                        className="rounded-full border-2 border-amber-500"
                                    />
                                </div>
                            );
                        })}
                    </div>

                    {/* Centralny napis */}
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
        // Podziel graczy na kolumny - zigzag od dołu: prawo, lewo, prawo, lewo...
        // playersToReveal[0] to najsłabszy gracz, playersToReveal[length-1] to najlepszy (4. miejsce)
        const leftColumn: WeeklyPlayerStats[] = [];
        const rightColumn: WeeklyPlayerStats[] = [];
        const centerRow: WeeklyPlayerStats[] = []; // Dla nieparzystej liczby - najlepszy (4. miejsce) samotnie
        
        if (playersToReveal.length % 2 === 1) {
            // Nieparzysta liczba - najlepszy (ostatni w tablicy) sam wyśrodkowany
            centerRow.push(playersToReveal[playersToReveal.length - 1]);
            // Reszta naprzemiennie od najsłabszego: pierwszy w prawo, drugi w lewo...
            for (let i = 0; i < playersToReveal.length - 1; i++) {
                if (i % 2 === 0) {
                    rightColumn.push(playersToReveal[i]);
                } else {
                    leftColumn.push(playersToReveal[i]);
                }
            }
        } else {
            // Parzysta liczba - normalny zigzag: pierwszy w prawo, drugi w lewo...
            playersToReveal.forEach((player, index) => {
                if (index % 2 === 0) {
                    rightColumn.push(player);
                } else {
                    leftColumn.push(player);
                }
            });
        }
        
        const hasCenter = centerRow.length > 0;
        const columns = hasCenter ? [leftColumn, centerRow, rightColumn] : [leftColumn, rightColumn];

        return (
            <div className="absolute inset-0 flex flex-col justify-center items-center" style={{ padding: '9vh 0' }}>
                {/* Lista avatarów po lewej - widoczna podczas odkrywania graczy */}
                <div className="absolute left-8 top-1/2 -translate-y-1/2 grid grid-cols-2 gap-3" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
                    {allPlayersAlphabetically.map(player => {
                        const isRevealed = revealedNicknames.has(player.nickname);
                        return (
                            <div 
                                key={player.nickname}
                                className="relative"
                                style={{
                                    width: `${avatarSize}px`,
                                    height: `${avatarSize}px`,
                                    filter: isRevealed ? 'grayscale(100%)' : 'none',
                                    opacity: isRevealed ? 0.3 : 1,
                                    transition: 'filter 0.5s ease, opacity 0.5s ease'
                                }}
                            >
                                <Image
                                    src={`/images/avatars/${player.nickname}.png`}
                                    alt={player.nickname}
                                    width={avatarSize}
                                    height={avatarSize}
                                    className="rounded-full border-2 border-amber-500"
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="relative w-full flex flex-col items-center" style={{ gap: `${gapSize}px` }}>
                    {/* Gracz 4. wyśrodkowany na górze (jeśli nieparzysta liczba) */}
                    {hasCenter && centerRow.length > 0 && (
                        <div className="flex justify-center" style={{ width: '45%', maxWidth: isFullscreen ? '450px' : '350px' }}>
                            {centerRow.map((player) => {
                                const globalIndex = playersToReveal.findIndex(p => p.nickname === player.nickname);
                                const isVisible = globalIndex < visibleCount;
                                const isNew = globalIndex === visibleCount - 1;
                                const actualPosition = playersToReveal.length - globalIndex + 3;
                                
                                if (!isVisible) {
                                    // Placeholder - niewidoczny ale zajmuje miejsce
                                    return (
                                        <div
                                            key={`placeholder-${player.nickname}`}
                                            className="flex items-center bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm rounded-lg shadow-2xl w-full"
                                            style={{
                                                padding: `${padding}px ${padding * 1.5}px`,
                                                minHeight: `${calculatedItemHeight}px`,
                                                gap: `${Math.max(6, padding * 0.8)}px`,
                                                border: `${calculatedItemHeight < 60 ? '1px' : '2px'} solid rgba(251, 191, 36, 0.5)`,
                                                visibility: 'hidden'
                                            }}
                                        >
                                            <div className={`font-bold text-amber-400 ${fontSize} flex-shrink-0`} style={{ width: `${numberWidth}px`, textAlign: 'center' }}>#</div>
                                            <div className="relative rounded-lg overflow-hidden border-amber-400 shadow-xl flex-shrink-0" style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderWidth: calculatedItemHeight < 60 ? '2px' : '3px' }} />
                                            <div className="flex-grow">
                                                <div className={`font-bold text-white ${fontSize} leading-tight mb-1`}>&nbsp;</div>
                                                <div className={`text-amber-300 ${smallFontSize} leading-tight`}>&nbsp;</div>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div
                                        key={player.nickname}
                                        className="flex items-center bg-gradient-to-r from-zinc-800/90 to-zinc-900/90 backdrop-blur-sm rounded-lg shadow-2xl w-full"
                                        style={{
                                            padding: `${padding}px ${padding * 1.5}px`,
                                            minHeight: `${calculatedItemHeight}px`,
                                            gap: `${Math.max(6, padding * 0.8)}px`,
                                            border: `${calculatedItemHeight < 60 ? '1px' : '2px'} solid rgba(251, 191, 36, 0.5)`,
                                            opacity: isNew ? 0 : 1,
                                            animation: isNew ? 'fadeInSlide 0.7s ease-out forwards' : 'none'
                                        }}
                                    >
                                        <div className={`font-bold text-amber-400 ${fontSize} flex-shrink-0`} style={{ width: `${numberWidth}px`, textAlign: 'center' }}>
                                            #{actualPosition}
                                        </div>
                                        <div className="relative rounded-lg overflow-hidden border-amber-400 shadow-xl flex-shrink-0" style={{ width: `${avatarSize}px`, height: `${avatarSize}px`, borderWidth: calculatedItemHeight < 60 ? '2px' : '3px' }}>
                                            <Image src={`/images/avatars/${player.nickname}.png`} alt={player.nickname} fill className="object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.src = '/images/avatars/placeholder.png'; }} />
                                        </div>
                                        <div className="flex-grow">
                                            <div className={`font-bold text-white ${fontSize} leading-tight mb-1`}>{player.nickname}</div>
                                            <div className={`text-amber-300 ${smallFontSize} leading-tight`}><span className="font-bold">{player.totalPoints}</span> DAP</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    {/* Dwie kolumny z resztą graczy */}
                    <div className="relative w-full flex justify-center gap-4">
                    {columns.filter((_, idx) => !hasCenter || idx !== 1).map((columnPlayers, columnIndex) => {
                        return (
                            <div 
                                key={`column-${columnIndex}`}
                                className="flex flex-col-reverse" 
                                style={{ 
                                    width: '45%',
                                    maxWidth: isFullscreen ? '450px' : '350px',
                                    gap: `${gapSize}px`
                                }}
                            >
                        {columnPlayers.map((player) => {
                            // Oblicz globalny indeks gracza w oryginalnej liście playersToReveal
                            // Ponieważ rozdzielaliśmy naprzemiennie: lewa=0,2,4... prawa=1,3,5...
                            const globalIndex = playersToReveal.findIndex(p => p.nickname === player.nickname);
                            // Sprawdź czy ten gracz jest już widoczny
                            const isVisible = globalIndex < visibleCount;
                            const isNew = globalIndex === visibleCount - 1;
                            // Oblicz pozycję: playersToReveal są odwróceni, więc ostatni w tablicy to 4. miejsce
                            const actualPosition = playersToReveal.length - globalIndex + 3; // +3 bo top 3 nie jest w tej liście
                            
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

    // Funkcja pomocnicza do określenia rangi na podstawie ratingu
    function getRankName(rating: number): string {
        if (rating >= 2500) return 'PIERDOLONA LEGENDA';
        if (rating >= 2400) return 'CELESTIAL OVERLORD';
        if (rating >= 2300) return 'GRANDMASTER';
        if (rating >= 2200) return 'MASTER';
        if (rating >= 2150) return 'VIRTUOSO';
        if (rating >= 2100) return 'THE SPECIALIST';
        if (rating >= 2050) return 'THE CAPTAIN';
        if (rating >= 1975) return 'THE CREWMATE';
        if (rating >= 1875) return 'THE CADET';
        if (rating >= 1750) return 'THE PISSLOW';
        return 'CWEL';
    }

    // SLAJD: Top 1 Player Details - nieużywana, ale zostawiona na przyszłość
    function _renderTopPlayerSlide(isFullscreen: boolean) {
        if (topPlayerGames.length === 0 || weeklyStats.length === 0) return null;

        // Znajdź TOP1 gracza
        const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
        const topPlayer = sortedStats[0];

        // Filtruj tylko gry tego gracza
        const playerGamesDetails = topPlayerGames.map(game => {
            const playerData = game.detailedStats.playersData.find(p => p.nickname === topPlayer.nickname);
            return {
                game,
                playerData,
                played: !!playerData
            };
        });

        // Rozmiar kwadratów
        const squareSize = isFullscreen ? 160 : 80;
        const gap = isFullscreen ? 16 : 12;

        return (
            <div 
                className="relative w-full h-full flex flex-col items-center justify-center px-8"
                style={{
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.5s ease-out'
                }}
            >
                {/* Tytuł - nick gracza */}
                <h1 
                    className={`font-bold text-amber-400 mb-4 ${isFullscreen ? 'text-8xl' : 'text-6xl'}`}
                    style={{
                        textShadow: '0 0 40px rgba(251, 191, 36, 0.7)',
                        textTransform: 'uppercase'
                    }}
                >
                    {topPlayer.nickname}
                </h1>

                {/* Podtytuł - data */}
                <p className={`text-amber-200 mb-12 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                    RUNDY Z {formatDate(date)}
                </p>

                {/* Grid z grami - dzielone na rzędy po 10 */}
                <div className="flex flex-col items-center" style={{ gap: `${gap}px` }}>
                    {Array.from({ length: Math.ceil(playerGamesDetails.length / 10) }).map((_, rowIndex) => {
                        const startIdx = rowIndex * 10;
                        const endIdx = Math.min(startIdx + 10, playerGamesDetails.length);
                        const rowGames = playerGamesDetails.slice(startIdx, endIdx);

                        return (
                            <div 
                                key={rowIndex}
                                className="flex justify-center"
                                style={{ gap: `${gap}px` }}
                            >
                                {rowGames.map((gameDetail, index) => {
                                    const { playerData, played } = gameDetail;
                                    const won = playerData?.win || false;
                                    const actualIndex = startIdx + index;

                                    return (
                                        <div key={actualIndex} className="flex flex-col items-center">
                                {/* Kwadrat z grą */}
                                <div
                                    className="relative"
                                    style={{
                                        width: `${squareSize}px`,
                                        height: `${squareSize}px`,
                                        border: played 
                                            ? (won ? '4px solid rgba(245, 216, 122, 1)' : '4px solid rgb(162, 17, 17)')
                                            : '4px solid rgb(100, 100, 100)',
                                        backgroundColor: played ? 'rgba(0, 0, 0, 0.6)' : 'rgba(50, 50, 50, 0.6)',
                                        boxShadow: played
                                            ? (won 
                                                ? 'inset 0 0 30px rgba(197, 176, 98, 0.5), inset 0 0 25px rgba(207, 178, 72, 0.3)'
                                                : 'inset 0 0 30px rgba(105, 13, 13, 0.5), inset 0 0 25px rgba(182, 41, 41, 0.3)')
                                            : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {played && playerData && (
                                        <Image
                                            src={`/images/roles/${playerData.role.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase()}.png`}
                                            alt={playerData.role}
                                            width={squareSize}
                                            height={squareSize}
                                            className="object-contain scale-[1.3]"
                                            style={{ position: 'relative', zIndex: 10 }}
                                        />
                                    )}
                                </div>

                                {/* Statystyki pod kwadratem */}
                                {played && playerData && (
                                    <div className={`text-center mt-2 ${isFullscreen ? 'text-s' : 'text-xs'} leading-tight`}>
                                        {/* Kills */}
                                        {playerData.originalStats.correctKills > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctKills} CORRECT KILL{playerData.originalStats.correctKills > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectKills > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectKills} INCORRECT KILL{playerData.originalStats.incorrectKills > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Guesses */}
                                        {playerData.originalStats.correctGuesses > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctGuesses} CORRECT GUESS{playerData.originalStats.correctGuesses > 1 ? 'ES' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectGuesses > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectGuesses} INCORRECT GUESS{playerData.originalStats.incorrectGuesses > 1 ? 'ES' : ''}</div>
                                        )}
                                        
                                        {/* Medic Shields */}
                                        {playerData.originalStats.correctMedicShields > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctMedicShields} CORRECT SHIELD{playerData.originalStats.correctMedicShields > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectMedicShields > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectMedicShields} INCORRECT SHIELD{playerData.originalStats.incorrectMedicShields > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Warden Fortifies */}
                                        {playerData.originalStats.correctWardenFortifies > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctWardenFortifies} CORRECT FORTIF{playerData.originalStats.correctWardenFortifies > 1 ? 'IES' : 'Y'}</div>
                                        )}
                                        {playerData.originalStats.incorrectWardenFortifies > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectWardenFortifies} INCORRECT FORTIF{playerData.originalStats.incorrectWardenFortifies > 1 ? 'IES' : 'Y'}</div>
                                        )}
                                        
                                        {/* Jailor Executes */}
                                        {playerData.originalStats.correctJailorExecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctJailorExecutes} CORRECT EXECUTE{playerData.originalStats.correctJailorExecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectJailorExecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectJailorExecutes} INCORRECT EXECUTE{playerData.originalStats.incorrectJailorExecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Prosecutor Prosecutes */}
                                        {playerData.originalStats.correctProsecutes > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctProsecutes} CORRECT PROSECUTE{playerData.originalStats.correctProsecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectProsecutes > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectProsecutes} INCORRECT PROSECUTE{playerData.originalStats.incorrectProsecutes > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Deputy Shoots */}
                                        {playerData.originalStats.correctDeputyShoots > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctDeputyShoots} CORRECT SHOT{playerData.originalStats.correctDeputyShoots > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectDeputyShoots > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectDeputyShoots} INCORRECT SHOT{playerData.originalStats.incorrectDeputyShoots > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Altruist Revives */}
                                        {playerData.originalStats.correctAltruistRevives > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctAltruistRevives} CORRECT REVIVE{playerData.originalStats.correctAltruistRevives > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectAltruistRevives > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectAltruistRevives} INCORRECT REVIVE{playerData.originalStats.incorrectAltruistRevives > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Swaps */}
                                        {playerData.originalStats.correctSwaps > 0 && (
                                            <div className="text-green-500">{playerData.originalStats.correctSwaps} CORRECT SWAP{playerData.originalStats.correctSwaps > 1 ? 'S' : ''}</div>
                                        )}
                                        {playerData.originalStats.incorrectSwaps > 0 && (
                                            <div className="text-red-500">{playerData.originalStats.incorrectSwaps} INCORRECT SWAP{playerData.originalStats.incorrectSwaps > 1 ? 'S' : ''}</div>
                                        )}
                                        
                                        {/* Janitor Cleans */}
                                        {playerData.originalStats.janitorCleans > 0 && (
                                            <div className="text-gray-400">{playerData.originalStats.janitorCleans} CLEAN{playerData.originalStats.janitorCleans > 1 ? 'S' : ''}</div>
                                        )}
                                    </div>
                                )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // SLAJD: Największe Sigmy Tygodnia
    function renderSigmasSlide(isFullscreen: boolean) {
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
                return renderPlayerHistory(top1Sigma.nickname, isFullscreen);
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
                                {renderRankingChart(rankingHistory, isFullscreen, date)}
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

    // Funkcja renderująca wykres rankingu
    function renderRankingChart(data: RankingHistoryPoint[], isFullscreen: boolean, weekDate: string) {
        if (data.length === 0) return null;

        // Parsuj datę tygodnia (format YYYYMMDD)
        const year = parseInt(weekDate.substring(0, 4));
        const month = parseInt(weekDate.substring(4, 6)) - 1; // miesiące są 0-indeksowane
        const day = parseInt(weekDate.substring(6, 8));
        const weekStartDate = new Date(year, month, day);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 7); // +7 dni na koniec tygodnia

        // Filtruj dane: weź ostatni punkt przed tygodniem + wszystkie punkty z tygodnia
        const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Znajdź ostatni punkt przed początkiem tygodnia
        const pointsBeforeWeek = sortedData.filter(p => p.date < weekStartDate);
        const lastPointBefore = pointsBeforeWeek.length > 0 
            ? pointsBeforeWeek[pointsBeforeWeek.length - 1] 
            : null;
        
        // Punkty z tygodnia
        const pointsInWeek = sortedData.filter(p => p.date >= weekStartDate && p.date < weekEndDate);
        
        // Połącz: punkt sprzed tygodnia (jeśli istnieje) + punkty z tygodnia
        // Jeśli nie ma punktu sprzed tygodnia i są punkty z tygodnia, dodaj punkt startowy 2000
        let filteredData: RankingHistoryPoint[];
        if (lastPointBefore) {
            filteredData = [lastPointBefore, ...pointsInWeek];
        } else if (pointsInWeek.length > 0) {
            // Gracz nie miał wcześniej rankingu - dodaj punkt startowy 2000
            const startPoint: RankingHistoryPoint = {
                date: new Date(pointsInWeek[0].date.getTime() - 1000), // 1 sekundę przed pierwszą grą
                rating: 2000,
                position: 0
            };
            filteredData = [startPoint, ...pointsInWeek];
        } else {
            filteredData = pointsInWeek;
        }
        
        if (filteredData.length === 0) return null;

        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = 800;
        const height = 400;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Przygotowanie danych
        const minScore = Math.min(...filteredData.map(d => d.rating));
        const maxScore = Math.max(...filteredData.map(d => d.rating));
        const scoreRange = maxScore - minScore || 1;
        const scorePadding = scoreRange * 0.1; // 10% padding

        // Funkcje skalowania
        const scaleX = (index: number) => (index / (filteredData.length - 1)) * chartWidth;
        const scaleY = (score: number) => 
            chartHeight - ((score - (minScore - scorePadding)) / (scoreRange + 2 * scorePadding)) * chartHeight;

        // Generowanie linii wykresu
        const pathData = filteredData
            .map((point, index) => {
                const x = scaleX(index);
                const y = scaleY(point.rating);
                return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(' ');

        // Formatowanie dat dla osi X
        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('pl-PL', {
                day: '2-digit',
                month: '2-digit'
            }).format(date);
        };

        // Punkty na osi X (pierwsze, ostatnie i co kilka punktów)
        const xAxisPoints = filteredData.filter((_, index) => 
            index === 0 || 
            index === filteredData.length - 1 || 
            index % Math.ceil(filteredData.length / 8) === 0
        );

        return (
            <svg 
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto"
                style={{ maxHeight: isFullscreen ? '500px' : '300px' }}
            >
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Linie siatki poziome */}
                    {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
                        const score = (maxScore + scorePadding) - (ratio * (scoreRange + 2 * scorePadding));
                        return (
                            <g key={ratio}>
                                <line
                                    x1={0}
                                    y1={chartHeight * ratio}
                                    x2={chartWidth}
                                    y2={chartHeight * ratio}
                                    stroke="rgb(80, 80, 80)"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={-10}
                                    y={chartHeight * ratio + 5}
                                    fill="rgb(161, 161, 170)"
                                    fontSize={isFullscreen ? "20" : "12"}
                                    textAnchor="end"
                                >
                                    {Math.round(score)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Oś X */}
                    <line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={2}
                    />

                    {/* Oś Y */}
                    <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={2}
                    />

                    {/* Etykiety osi X */}
                    {xAxisPoints.map((point) => {
                        const originalIndex = filteredData.findIndex(d => d.date.getTime() === point.date.getTime());
                        return (
                            <text
                                key={point.date.getTime()}
                                x={scaleX(originalIndex)}
                                y={chartHeight + 20}
                                fill="rgb(161, 161, 170)"
                                fontSize={isFullscreen ? "12" : "10"}
                                textAnchor="middle"
                            >
                                {formatDate(point.date)}
                            </text>
                        );
                    })}

                    {/* Linia wykresu */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgb(245, 196, 37)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Gradient pod wykresem */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(238, 191, 39)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgba(245, 216, 122, 1)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Wypełnienie pod wykresem */}
                    <path
                        d={`${pathData} L ${scaleX(filteredData.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
                        fill="url(#areaGradient)"
                    />

                    {/* Punkty na wykresie */}
                    {filteredData.map((point, index) => {
                        const x = scaleX(index);
                        const y = scaleY(point.rating);
                        const isFirst = index === 0;
                        const isLast = index === filteredData.length - 1;
                        
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isFirst || isLast ? 6 : 4}
                                    fill="#fbbf24"
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                                {(isFirst || isLast) && (
                                    <text
                                        x={x}
                                        y={y - 15}
                                        fill="#f5d87a"
                                        fontSize={isFullscreen ? "16" : "14"}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {Math.round(point.rating)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        );
    }

    // Funkcja renderująca slajd "Największe Cwele Tygodnia"
    function renderCweleSlide(isFullscreen: boolean) {
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
                return renderPlayerHistory(top1Cwel.nickname, isFullscreen);
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
                                {renderCwelRankingChart(rankingHistory, isFullscreen, date)}
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

    // Funkcja renderująca wykres rankingu dla cweli (kolor czerwony)
    function renderCwelRankingChart(data: RankingHistoryPoint[], isFullscreen: boolean, weekDate: string) {
        if (data.length === 0) return null;

        // Parsuj datę tygodnia (format YYYYMMDD)
        const year = parseInt(weekDate.substring(0, 4));
        const month = parseInt(weekDate.substring(4, 6)) - 1; // miesiące są 0-indeksowane
        const day = parseInt(weekDate.substring(6, 8));
        const weekStartDate = new Date(year, month, day);
        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 7); // +7 dni na koniec tygodnia

        // Filtruj dane: weź ostatni punkt przed tygodniem + wszystkie punkty z tygodnia
        const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());
        
        // Znajdź ostatni punkt przed początkiem tygodnia
        const pointsBeforeWeek = sortedData.filter(p => p.date < weekStartDate);
        const lastPointBefore = pointsBeforeWeek.length > 0 ? pointsBeforeWeek[pointsBeforeWeek.length - 1] : null;
        
        // Punkty z tygodnia
        const pointsInWeek = sortedData.filter(p => p.date >= weekStartDate && p.date < weekEndDate);
        
        // Połącz: punkt sprzed tygodnia (jeśli istnieje) + punkty z tygodnia
        // Jeśli nie ma punktu sprzed tygodnia i są punkty z tygodnia, dodaj punkt startowy 2000
        let filteredData: RankingHistoryPoint[];
        if (lastPointBefore) {
            filteredData = [lastPointBefore, ...pointsInWeek];
        } else if (pointsInWeek.length > 0) {
            // Gracz nie miał wcześniej rankingu - dodaj punkt startowy 2000
            const startPoint: RankingHistoryPoint = {
                date: new Date(pointsInWeek[0].date.getTime() - 1000), // 1 sekundę przed pierwszą grą
                rating: 2000,
                position: 0
            };
            filteredData = [startPoint, ...pointsInWeek];
        } else {
            filteredData = pointsInWeek;
        }
        
        if (filteredData.length === 0) return null;

        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const width = 800;
        const height = 400;
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Przygotowanie danych
        const minScore = Math.min(...filteredData.map(d => d.rating));
        const maxScore = Math.max(...filteredData.map(d => d.rating));
        const scoreRange = maxScore - minScore || 1;
        const scorePadding = scoreRange * 0.1; // 10% padding

        // Funkcje skalowania
        const scaleX = (index: number) => (index / (filteredData.length - 1)) * chartWidth;
        const scaleY = (score: number) => 
            chartHeight - ((score - (minScore - scorePadding)) / (scoreRange + 2 * scorePadding)) * chartHeight;

        // Generowanie linii wykresu
        const pathData = filteredData
            .map((point, index) => {
                const x = scaleX(index);
                const y = scaleY(point.rating);
                return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(' ');

        // Formatowanie dat dla osi X
        const formatDate = (date: Date) => {
            return new Intl.DateTimeFormat('pl-PL', {
                day: '2-digit',
                month: '2-digit'
            }).format(date);
        };

        // Punkty na osi X (pierwsze, ostatnie i co kilka punktów)
        const xAxisPoints = filteredData.filter((_, index) => 
            index === 0 || 
            index === filteredData.length - 1 || 
            index % Math.ceil(filteredData.length / 8) === 0
        );

        // Poziome linie pomocnicze (gridlines)
        const yAxisTicks = 5;
        const yAxisValues = Array.from({ length: yAxisTicks }, (_, i) => 
            minScore - scorePadding + (i * (scoreRange + 2 * scorePadding) / (yAxisTicks - 1))
        );

        return (
            <svg width={width} height={height}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Poziome linie pomocnicze */}
                    {yAxisValues.map((score, index) => {
                        const ratio = 1 - (score - (minScore - scorePadding)) / (scoreRange + 2 * scorePadding);
                        return (
                            <g key={index}>
                                <line
                                    x1={0}
                                    y1={chartHeight * ratio}
                                    x2={chartWidth}
                                    y2={chartHeight * ratio}
                                    stroke="rgb(82, 82, 91)"
                                    strokeWidth={1}
                                    strokeDasharray="4 4"
                                />
                                <text
                                    x={-10}
                                    y={chartHeight * ratio + 5}
                                    fill="rgb(161, 161, 170)"
                                    fontSize={isFullscreen ? "14" : "12"}
                                    textAnchor="end"
                                >
                                    {Math.round(score)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Oś X */}
                    <line
                        x1={0}
                        y1={chartHeight}
                        x2={chartWidth}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={2}
                    />

                    {/* Oś Y */}
                    <line
                        x1={0}
                        y1={0}
                        x2={0}
                        y2={chartHeight}
                        stroke="rgb(156, 163, 175)"
                        strokeWidth={2}
                    />

                    {/* Etykiety osi X */}
                    {xAxisPoints.map((point) => {
                        const originalIndex = filteredData.findIndex(d => d.date.getTime() === point.date.getTime());
                        return (
                            <text
                                key={point.date.getTime()}
                                x={scaleX(originalIndex)}
                                y={chartHeight + 20}
                                fill="rgb(161, 161, 170)"
                                fontSize={isFullscreen ? "12" : "10"}
                                textAnchor="middle"
                            >
                                {formatDate(point.date)}
                            </text>
                        );
                    })}

                    {/* Linia wykresu - kolor czerwony dla cweli */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgb(162, 17, 17)"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Gradient pod wykresem - czerwony */}
                    <defs>
                        <linearGradient id="cwelAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="rgb(162, 17, 17)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="rgb(162, 17, 17)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Wypełnienie pod wykresem */}
                    <path
                        d={`${pathData} L ${scaleX(filteredData.length - 1)} ${chartHeight} L 0 ${chartHeight} Z`}
                        fill="url(#cwelAreaGradient)"
                    />

                    {/* Punkty na wykresie */}
                    {filteredData.map((point, index) => {
                        const x = scaleX(index);
                        const y = scaleY(point.rating);
                        const isFirst = index === 0;
                        const isLast = index === filteredData.length - 1;
                        
                        return (
                            <g key={index}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={isFirst || isLast ? 6 : 4}
                                    fill="#ef4444"
                                    stroke="#fff"
                                    strokeWidth={2}
                                />
                                {(isFirst || isLast) && (
                                    <text
                                        x={x}
                                        y={y - 15}
                                        fill="#ef4444"
                                        fontSize={isFullscreen ? "16" : "14"}
                                        fontWeight="bold"
                                        textAnchor="middle"
                                    >
                                        {Math.round(point.rating)}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        );
    }

    // Funkcja renderująca slajd "Lista de Emperadores"
    function renderEmperorHistorySlide(isFullscreen: boolean) {
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
                    className={`${videotext.className} font-bold text-red-400 mb-8 ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}
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
                        gap: emperorHistory.length > 4 ? '0.75rem' : '1rem',
                        maxHeight: '60vh'
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
                        const scaleFactor = emperorHistory.length > 4 ? 0.85 : 1;
                        const avatarSize = isFullscreen ? 100 * scaleFactor : 80 * scaleFactor;
                        const fontSize = emperorHistory.length > 4 
                            ? (isFullscreen ? 'text-4xl' : 'text-2xl')
                            : (isFullscreen ? 'text-5xl' : 'text-3xl');
                        const starSize = emperorHistory.length > 4 
                            ? (isFullscreen ? 'text-6xl' : 'text-4xl')
                            : (isFullscreen ? 'text-7xl' : 'text-5xl');
                        
                        return (
                            <div
                                key={emperor.nickname}
                                className="flex items-center"
                                style={{ padding: emperorHistory.length > 4 ? '1rem' : '1.5rem' }}
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
                                    <Image
                                        src={`/images/avatars/${emperor.nickname}.png`}
                                        alt={emperor.nickname}
                                        fill
                                        className="object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = '/images/avatars/placeholder.png';
                                        }}
                                    />
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
                                        const starSizePx = emperorHistory.length > 4 
                                            ? (isFullscreen ? 60 : 40)
                                            : (isFullscreen ? 70 : 50);
                                        
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

    // Funkcja do określenia tieru na podstawie ratingu
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

    // Funkcja renderująca slajd z rankingiem po sesji
    function renderFinalRankingSlide(isFullscreen: boolean) {
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

}
