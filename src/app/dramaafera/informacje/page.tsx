import Link from "next/link";

export default function InnePage() {
    return (
        <div className="min-h-screen bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Informacje
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Co jest punktowane, a co nie?
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-3xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-6">
                        Za co są punkty?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-green-400 mb-4">Na plus:</h3>
                            <ul className="list-disc list-inside text-gray-200 space-y-2 text-lg">
                                <li>Za poprawne zabójstwo.</li>
                                <li>Za poprawnego guessa.</li>
                                <li>Za poprawną egzekucję jako Jailor.</li>
                                <li>Za poprawne skazanie jako Prosecutor.</li>
                                <li>Wskrzeszenie Crewmatea lub swojego Guardian Angela jako Altruist.</li>
                                <li>Za nałożenie Shielda Crewmateowi, swojemu Guardian Angelowi lub swojemu Loversowi jako Medic.</li>
                                <li>Za nałożenie Fortify Crewmateowi, swojemu Guardian Angelowi lub swojemu Loversowi jako Warden.</li>
                                <li>Za poprawnego Swapa jako Swapper (Wygłosowany Impostor albo Neutral).</li>
                                <li>Za zabójstwo jako Deputy.</li>
                                <li>Za sprzątnięcie ciała jako Janitor.</li>
                                <li>Za wykonane taski. Taski nie liczą się graczom z modyfikatorem Lover oraz graczom którzy nie zaczęli gry jako crewmate.
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-red-400 mb-4">Na minus:</h3>
                            <ul className="list-disc list-inside text-gray-200 space-y-2 text-lg">
                                <li>Za niepoprawne zabójstwo.</li>
                                <li>Za niepoprawnego guessa.</li>
                                <li>Za niepoprawną egzekucję jako Jailor.</li>
                                <li>Za poprawne skazanie jako Prosecutor.</li>
                                <li>Wskrzeszenie Impostora lub Neutrala jako Altruist.</li>
                                <li>Za nałożenie tarczy Impostorowi lub Neutralowi jako Medic.</li>
                                <li>Za nałożenie Fortify Impostorowi lub Neutralowi jako Warden.</li>
                                <li>Za niepoprawnego Swapa jako Swapper (wygłosowany Crewmate albo Jester).</li>
                                <li>Za jakiekolwiek wyjście z lobby przed zakończeniem gry (sytuacje wyjątkowe będą rozpatrywane indywidualnie).</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
