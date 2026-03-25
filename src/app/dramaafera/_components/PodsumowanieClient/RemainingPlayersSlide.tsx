import { useState, useEffect } from 'react';
import Image from 'next/image';
import { WeeklyPlayerStats } from './types';
import { AvatarImageFill } from './AvatarImage';

interface RemainingPlayersSlideProps {
    isFullscreen: boolean;
    weeklyStats: WeeklyPlayerStats[];
    step: number;
}

export default function RemainingPlayersSlide({ isFullscreen, weeklyStats, step }: RemainingPlayersSlideProps) {
    const [screenHeight, setScreenHeight] = useState(800);

    useEffect(() => {
        setScreenHeight(window.innerHeight);
    }, []);

    // Sortuj według punktów DAP (malejąco) - tak samo jak w hostinfo
    const sortedStats = [...weeklyStats].sort((a, b) => b.totalPoints - a.totalPoints);
    
    // Sprawdź czy jest remis na 3. miejscu
    const hasThirdPlaceTie = sortedStats.length >= 4 && 
        sortedStats[2].totalPoints === sortedStats[3].totalPoints;
    
    // Gracze do odkrycia:
    // Przy remisie na 3. miejscu: od 5. miejsca (pomijamy top 2 + dwóch na remisie)
    // Normalnie: od 4. miejsca (pomijamy top 3)
    const startIndex = hasThirdPlaceTie ? 4 : 3;
    const playersToReveal = sortedStats.slice(startIndex).reverse(); // Bierzemy od odpowiedniego miejsca w górę i odwracamy
    
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
    if (step === 0) {
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
                                        <AvatarImageFill nickname={player.nickname} />
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
                                    <AvatarImageFill nickname={player.nickname} />
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

        </div>
    );
}
