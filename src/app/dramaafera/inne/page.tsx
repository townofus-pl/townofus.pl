import Link from "next/link";

export default function InnePage() {
    return (
        <div className="min-h-screen bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link 
                        href="/dramaafera" 
                        className="text-blue-400 hover:text-blue-300 transition-colors mb-4 inline-block"
                    >
                        ← Powrót do Drama Afera
                    </Link>
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Inne
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Dodatkowe funkcje i narzędzia Drama Afera
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Sekcja Narzędzia */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-semibold text-yellow-400 border-b border-yellow-400/30 pb-2">
                            🛠️ Narzędzia
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-blue-400 mb-3">Generator Ról</h3>
                                <p className="text-gray-300 mb-4">
                                    Automatyczny generator losowych ról dla gier Among Us.
                                </p>
                                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                                    Uruchom Generator
                                </button>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-green-400 mb-3">Kalkulator Statystyk</h3>
                                <p className="text-gray-300 mb-4">
                                    Oblicz swoje statystyki wygranych i przeanalizuj wyniki.
                                </p>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">
                                    Otwórz Kalkulator
                                </button>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-purple-400 mb-3">Timer Gry</h3>
                                <p className="text-gray-300 mb-4">
                                    Stoper do mierzenia czasu trwania gier i rundek.
                                </p>
                                <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
                                    Uruchom Timer
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sekcja Społeczność */}
                    <div className="space-y-6">
                        <h2 className="text-3xl font-semibold text-pink-400 border-b border-pink-400/30 pb-2">
                            👥 Społeczność
                        </h2>
                        
                        <div className="space-y-4">
                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-blue-400 mb-3">Discord Drama Afera</h3>
                                <p className="text-gray-300 mb-4">
                                    Dołącz do naszego serwera Discord i graj z innymi!
                                </p>
                                <a 
                                    href="https://discord.gg/dramaafera" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-2 rounded transition-colors inline-block"
                                >
                                    Dołącz na Discord
                                </a>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-red-400 mb-3">YouTube</h3>
                                <p className="text-gray-300 mb-4">
                                    Oglądaj najlepsze momenty z gier na naszym kanale.
                                </p>
                                <a 
                                    href="#" 
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors inline-block"
                                >
                                    Subskrybuj Kanał
                                </a>
                            </div>

                            <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                                <h3 className="text-xl font-semibold text-purple-400 mb-3">Twitch</h3>
                                <p className="text-gray-300 mb-4">
                                    Oglądaj nasze livestreamy z gier Among Us.
                                </p>
                                <a 
                                    href="#" 
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors inline-block"
                                >
                                    Śledź na Twitch
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sekcja Informacje */}
                <div className="mt-12">
                    <h2 className="text-3xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-2 mb-6">
                        ℹ️ Informacje
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                            <h3 className="text-lg font-semibold text-yellow-400 mb-3">📋 Regulamin</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Zapoznaj się z regulaminem serwera Drama Afera.
                            </p>
                            <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm underline">
                                Przeczytaj regulamin →
                            </Link>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                            <h3 className="text-lg font-semibold text-green-400 mb-3">📖 Poradniki</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Naucz się grać lepiej dzięki naszym poradnikom.
                            </p>
                            <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm underline">
                                Zobacz poradniki →
                            </Link>
                        </div>

                        <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm border border-gray-700/50">
                            <h3 className="text-lg font-semibold text-red-400 mb-3">🐛 Zgłoś Bug</h3>
                            <p className="text-gray-300 text-sm mb-4">
                                Znalazłeś błąd? Zgłoś go naszemu zespołowi.
                            </p>
                            <Link href="#" className="text-blue-400 hover:text-blue-300 text-sm underline">
                                Zgłoś problem →
                            </Link>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mt-12">
                    <h2 className="text-3xl font-semibold text-orange-400 border-b border-orange-400/30 pb-2 mb-6">
                        ❓ Często Zadawane Pytania
                    </h2>
                    
                    <div className="space-y-4">
                        <details className="bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <summary className="p-4 cursor-pointer text-lg font-semibold text-blue-400 hover:text-blue-300">
                                Jak dołączyć do gier Drama Afera?
                            </summary>
                            <div className="px-4 pb-4 text-gray-300">
                                <p>Aby dołączyć do gier, musisz być członkiem naszego serwera Discord. Gry odbywają się codziennie wieczorem.</p>
                            </div>
                        </details>

                        <details className="bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <summary className="p-4 cursor-pointer text-lg font-semibold text-blue-400 hover:text-blue-300">
                                Jakie mody używacie?
                            </summary>
                            <div className="px-4 pb-4 text-gray-300">
                                <p>Używamy modów Town of Us oraz custom ustawień, które można pobrać ze strony ustawień.</p>
                            </div>
                        </details>

                        <details className="bg-gray-800/50 rounded-lg backdrop-blur-sm border border-gray-700/50">
                            <summary className="p-4 cursor-pointer text-lg font-semibold text-blue-400 hover:text-blue-300">
                                Czy mogę zaproponować nową rolę?
                            </summary>
                            <div className="px-4 pb-4 text-gray-300">
                                <p>Tak! Propozycje nowych ról można zgłaszać na naszym serwerze Discord w odpowiednim kanale.</p>
                            </div>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
