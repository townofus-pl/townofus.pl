import Image from 'next/image';
import { videotext } from './constants';
import { AvatarImageFill } from './AvatarImage';

interface IntroSlideProps {
    isFullscreen: boolean;
    currentStep: number;
    introInitialDelayPassed: boolean;
    randomAvatars: string[];
}

// Funkcja renderująca finalne intro z logo
function renderFinalIntro(isFullscreen: boolean, randomAvatars: string[]) {
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
                                     <AvatarImageFill nickname={player} className="object-cover" style={{ objectPosition: 'center' }} />
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

export default function IntroSlide({ isFullscreen, currentStep, introInitialDelayPassed, randomAvatars }: IntroSlideProps) {
    // Tablica tekstów dla kroków 0-6 (automatyczna sekwencja)
    const introTexts = ['A', 'AMONG', 'US', 'DRA', 'DRAMA', 'A', 'AFE'];
    
    // ZAWSZE renderuj finalne intro (z logo) na dole jako bazę
    const finalIntroContent = renderFinalIntro(isFullscreen, randomAvatars);
    
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
