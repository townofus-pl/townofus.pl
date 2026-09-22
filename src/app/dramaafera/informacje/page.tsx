import { CURRENT_SEASON } from '../_constants/seasons';
import { SCORING_GROUPS, DISCONNECT_NOTE, scoringSign } from '../_constants/scoringCopy';

/**
 * What is scored, and at what rate.
 *
 * **The weights are deliberately not shown.** The page says what counts and whether it helps or
 * hurts, not by how much. The generated table from the mod still drives it: it decides each sign,
 * and a test asserts nothing the mod scores is missing here. Wording lives in
 * `_constants/scoringCopy.ts`.
 *
 * Deliberately not season-scoped. It describes how the league scores *now*; season 2 and 3 were
 * scored by the server under rules that exist nowhere in a form this page could render, so a
 * `sezon/N/informacje` would be two rule sets with a source for only one. The heading says which
 * season it speaks for instead. See #316.
 */
export default function InformacjePage() {
    return (
        <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Informacje
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Co jest punktowane, a co nie — zasady sezonu {CURRENT_SEASON} (TOU:Mira)
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-12 space-y-10">
                    {SCORING_GROUPS.map((group) => (
                        <section key={group.title}>
                            <h2 className="text-3xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-4">
                                {group.title}
                            </h2>
                            {group.intro && <p className="text-gray-300 mb-5 text-lg">{group.intro}</p>}

                            <ul className="space-y-3">
                                {group.entries.map((entry) => {
                                    const sign = scoringSign(entry.key);
                                    const { mark, tone } = {
                                        plus: { mark: '+', tone: 'text-green-400' },
                                        minus: { mark: '\u2212', tone: 'text-red-400' },
                                        none: { mark: '0', tone: 'text-gray-500' },
                                    }[sign];

                                    return (
                                        <li
                                            key={entry.key}
                                            className="flex items-start gap-4 bg-zinc-800/30 rounded-lg px-4 py-3"
                                        >
                                            <span
                                                className={`${tone} font-bold text-2xl shrink-0 w-6 text-center leading-7`}
                                                aria-hidden
                                            >
                                                {mark}
                                            </span>
                                            <span className="flex flex-col">
                                                <span className="text-gray-100 text-lg">{entry.label}</span>
                                                {entry.detail && (
                                                    <span className="text-gray-400 text-sm mt-1">{entry.detail}</span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))}

                    <section>
                        <h2 className="text-3xl font-semibold text-red-400 border-b border-red-400/30 pb-2 mb-4">
                            Wyjście z gry
                        </h2>
                        <p className="text-gray-200 text-lg">{DISCONNECT_NOTE}</p>
                    </section>

                    <p className="text-gray-500 text-sm">
                        Punkty liczy mod, a strona je tylko sumuje. Nie podajemy tutaj konkretnych wag —
                        lista tego, co jest punktowane, jest wyciągana wprost ze źródła moda, więc nie
                        może się z nim rozjechać.
                    </p>
                </div>
            </div>
        </div>
    );
}
