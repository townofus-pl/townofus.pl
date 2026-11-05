import { CURRENT_SEASON } from '../_constants/seasons';

/** Strona informacyjna: reguły ligi dla graczy. */

type Rule = { label: string; detail?: string };

const PLUS: Rule[] = [
    { label: 'Wygrana gra' },
    { label: 'Każda przeżyta runda' },
    {
        label: 'Wykonane taski',
        detail: 'Tylko jeśli zaczynałeś grę jako Crewmate — późniejsza zmiana roli tego nie odbiera.',
    },
    {
        label: 'Dobry głos na zebraniu',
        detail: 'Tylko jeśli grasz jako Crewmate',
    },
    {
        label: 'Zabójstwo kogoś, kto nie jest w twojej drużynie',
        detail: 'Część ról ma własne zasady, kogo wolno im trafić — sprawdź opis swojej roli.',
    },
    {
        label: 'Ochrona albo wskrzeszenie kogoś ze swojej drużyny',
        detail: 'Lover i Fairy liczą się jako twoja strona, choćby grali w innej frakcji.',
    },
    {
        label: 'Swap albo skazanie, przez które wylatuje ktoś spoza twojej strony',
    },
    { label: 'Sprzątnięcie ciała jako Janitor' },
];

const MINUS: Rule[] = [
    {
        label: 'Zły głos na zebraniu',
        detail: 'Tylko jeśli grasz jako Crewmate',
    },
    {
        label: 'Zabójstwo kogoś ze swojej drużyny',
    },
    { label: 'Ochrona albo wskrzeszenie kogoś spoza swojej drużyny' },
    {
        label: 'Swap albo skazanie, przez które wylatuje Crewmate albo Jester',
    },
    {
        label: 'Wyjście z gry przed jej końcem',
        detail:
            'Obniża twój wynik do najniższego wśród graczy w danej rozgrywce.'
    },
];

function RuleList({ rules }: { rules: Rule[] }) {
    return (
        <ul className="list-disc list-inside text-gray-200 space-y-3 text-lg">
            {rules.map((rule) => (
                <li key={rule.label}>
                    {rule.label}
                    {rule.detail && (
                        <span className="block text-gray-400 text-sm ml-6 mt-1">{rule.detail}</span>
                    )}
                </li>
            ))}
        </ul>
    );
}

export default function InformacjePage() {
    return (
        <div className="min-h-screen bg-zinc-900/50 rounded-xl text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-6xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">
                        Informacje
                    </h1>
                    <p className="text-center text-gray-300 mt-4 text-lg">
                        Co jest punktowane, a co nie
                    </p>
                </div>

                <div className="max-w-4xl mx-auto mb-12">
                    <h2 className="text-3xl font-semibold text-blue-400 border-b border-blue-400/30 pb-2 mb-6">
                        Za co są punkty?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-2xl font-semibold text-green-400 mb-4">Na plus:</h3>
                            <RuleList rules={PLUS} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold text-red-400 mb-4">Na minus:</h3>
                            <RuleList rules={MINUS} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
