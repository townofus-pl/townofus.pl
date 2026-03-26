"use client";

import { useState } from "react";
import Image from "next/image";
import type { GameDateEntry, HostInfoResult } from "@/app/dramaafera/_services";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { getHostInfoAction, getGameDatesAction } from "@/app/dramaafera/_actions/seasonActions";
import { buildSeasonUrl } from "@/app/dramaafera/_utils/seasonHelpers";

// Stała lokalna — nie importujemy z rankingCalculator, żeby nie wciągać
// zależności serwera (Zod, OpenAPI) do bundle'u klienta.
const START_RATING = 2000;

type UploadStatus = {
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
};

type UploadApiResponse = {
    success: boolean;
    data?: {
        gameId?: string;
        message?: string;
    };
    error?: {
        message?: string;
    };
};

interface HostClientProps {
    initialDates: GameDateEntry[];
    seasonId: number;
}

export default function HostClient({ initialDates, seasonId }: HostClientProps) {
    const [availableDates, setAvailableDates] = useState<GameDateEntry[]>(initialDates);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [hostInfo, setHostInfo] = useState<HostInfoResult | null>(null);
    const [dataLoading, setDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Admin: resetuj ranking sezonu
    const [resetConfirm, setResetConfirm] = useState(false);
    const [resetStatus, setResetStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message?: string }>({ status: 'idle' });

    // Pobierz dane hosta dla wybranej daty (przez server action)
    const fetchHostInfo = async (date: string) => {
        try {
            setDataLoading(true);
            setError(null);

            const data = await getHostInfoAction(date, seasonId);
            setHostInfo(data);
        } catch (err) {
            console.error('Error fetching host info:', err);
            setError('Nie udało się pobrać danych hosta. Spróbuj ponownie później.');
            setHostInfo(null);
        } finally {
            setDataLoading(false);
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const date = e.target.value;
        setSelectedDate(date);
        if (date) {
            fetchHostInfo(date);
        } else {
            setHostInfo(null);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Sprawdź czy plik to JSON
        if (!file.name.endsWith('.json')) {
            setUploadStatus({
                status: 'error',
                message: 'Wybierz plik JSON'
            });
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
        setUploadStatus({ status: 'idle', message: undefined });
    };

    const handleSendFile = async () => {
        if (!selectedFile) return;

        setUploadStatus({ status: 'uploading' });

        try {
            const formData = new FormData();
            formData.append('gameDataFile', selectedFile);

            // Utwórz nagłówek autoryzacji Basic Auth
            const auth = btoa(`${credentials.username}:${credentials.password}`);

            // Użycie fetch zamiast server action — konieczne do przesłania multipart/form-data
            // z nagłówkiem Basic Auth. Server actions nie obsługują tego scenariusza
            // (nie można przekazać formData z własnym nagłówkiem Authorization przez "use server").
            const response = await fetch('/api/games/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${auth}`
                },
                body: formData
            });

            const data = await response.json() as UploadApiResponse;

            if (response.ok) {
                setUploadStatus({
                    status: 'success',
                    message: `Gra została pomyślnie wgrana: ${data.data?.gameId || ''}`
                });
                setCredentials({ username: '', password: '' });
                setSelectedFile(null);
                // Odśwież listę dat przez server action, żeby zachować filtr sezonu
                const updatedDates = await getGameDatesAction(seasonId);
                setAvailableDates(updatedDates.dates);
            } else {
                console.error('Błąd podczas uploadu gry:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: data,
                });
                setUploadStatus({
                    status: 'error',
                    message: 'Nie udało się wgrać gry. Sprawdź dane pliku i spróbuj ponownie.',
                });
            }
        } catch (err) {
            console.error('Błąd połączenia podczas uploadu gry:', err);
            setUploadStatus({
                status: 'error',
                message: 'Wystąpił błąd połączenia podczas wgrywania gry. Spróbuj ponownie później.',
            });
        }
    };

    const handleResetRanking = async () => {
        setResetStatus({ status: 'loading' });
        try {
            const auth = btoa(`${credentials.username}:${credentials.password}`);
            const response = await fetch('/api/season/reset', {
                method: 'POST',
                headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ seasonId }),
            });
            const data = await response.json() as { success: boolean; data?: { message?: string; resetCount?: number }; error?: string };
            if (response.ok) {
                setResetStatus({
                    status: 'success',
                    message: data.data?.message ?? 'Ranking został zresetowany.',
                });
                setResetConfirm(false);
            } else {
                setResetStatus({
                    status: 'error',
                    message: response.status === 401
                        ? 'Błędne dane logowania. Sprawdź użytkownika i hasło.'
                        : `Błąd: ${data.error ?? 'Nie udało się zresetować rankingu'}`,
                });
            }
        } catch {
            setResetStatus({ status: 'error', message: 'Błąd połączenia. Spróbuj ponownie.' });
        }
    };

    return (
        <div className="min-h-screen rounded-xl bg-zinc-900/50 text-white">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-5xl font-brook font-bold text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] mb-2">
                        Informacje dla Hosta
                    </h1>
                    <p className="text-center text-gray-400 mt-4 text-lg">
                        Wybierz datę sesji, aby zobaczyć szczegóły
                    </p>
                </div>

                {/* Sekcja wgrywania gry — tylko bieżący sezon */}
                {seasonId === CURRENT_SEASON && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 p-6">
                            <h2 className="text-2xl font-brook font-bold text-center mb-4">
                                Wgraj nową grę
                            </h2>

                            {/* Pola autoryzacji */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-2">
                                        Użytkownik:
                                    </label>
                                    <input
                                        type="text"
                                        id="username"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                                        className="w-full bg-zinc-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nazwa użytkownika"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-2">
                                        Hasło:
                                    </label>
                                    <input
                                        type="password"
                                        id="password"
                                        value={credentials.password}
                                        onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                        className="w-full bg-zinc-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Hasło"
                                    />
                                </div>
                            </div>

                            {/* Przycisk i input */}
                            <div className="flex flex-col items-center justify-center gap-4">
                                <label
                                    htmlFor="game-file-upload"
                                    className={`inline-block bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg shadow transition-colors text-lg cursor-pointer ${
                                        uploadStatus.status === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    Wgraj grę
                                </label>
                                <input
                                    id="game-file-upload"
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={handleFileUpload}
                                    disabled={uploadStatus.status === 'uploading'}
                                    className="hidden"
                                />

                                {/* Wybrany plik i przycisk wyślij */}
                                {selectedFile && (
                                    <div className="w-full bg-zinc-800 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-white truncate">{selectedFile.name}</span>
                                            </div>
                                            <button
                                                onClick={handleSendFile}
                                                disabled={uploadStatus.status === 'uploading'}
                                                className={`bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors whitespace-nowrap ${
                                                    uploadStatus.status === 'uploading' ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            >
                                                {uploadStatus.status === 'uploading' ? 'Wysyłanie...' : 'Wyślij'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Status uploadu */}
                            {uploadStatus.message && (
                                <div className={`mt-4 p-4 rounded-lg text-center ${
                                    uploadStatus.status === 'success'
                                        ? 'bg-green-900/30 border border-green-700/50 text-green-300'
                                        : 'bg-red-900/30 border border-red-700/50 text-red-300'
                                }`}>
                                    {uploadStatus.message}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Strefa niebezpieczna — reset rankingu sezonu */}
                {seasonId === CURRENT_SEASON && (
                    <div className="max-w-2xl mx-auto mb-8 bg-red-950/30 rounded-xl border border-red-800/50 p-6">
                        <details className="mt-3">
                            <summary className="cursor-pointer font-bold text-2xl text-red-300 hover:text-red-200 select-none list-none flex items-center gap-2 font-brook">
                                <span className="text-4xl">&#9888;</span> Resetuj ranking sezonu
                            </summary>
                            <div className="mt-5 pb-6">
                                <p className="text-red-200 text-sm mb-5">
                                    Ta operacja <strong>ustawia wszystkim graczom nowy wynik startowy</strong> ({START_RATING} pkt) i dodaje techniczny wpis resetujący w historii rankingu bieżącego sezonu. Używaj tylko na początku nowego sezonu.
                                </p>
                                {!resetConfirm ? (
                                    <button
                                        onClick={() => setResetConfirm(true)}
                                        className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg transition-colors"
                                    >
                                        Resetuj ranking
                                    </button>
                                ) : (
                                    <div className="flex gap-3 items-center">
                                        <span className="text-red-300 text-sm font-semibold">Na pewno?</span>
                                        <button
                                            onClick={handleResetRanking}
                                            disabled={resetStatus.status === 'loading'}
                                            className="bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2 rounded-lg transition-colors"
                                        >
                                            {resetStatus.status === 'loading' ? 'Resetowanie...' : 'Tak, resetuj'}
                                        </button>
                                        <button
                                            onClick={() => setResetConfirm(false)}
                                            className="bg-zinc-700 hover:bg-zinc-600 text-white font-bold px-4 py-2 rounded-lg transition-colors"
                                        >
                                            Anuluj
                                        </button>
                                    </div>
                                )}
                                {resetStatus.message && (
                                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                                        resetStatus.status === 'success'
                                            ? 'bg-green-900/30 border border-green-700/50 text-green-300'
                                            : 'bg-red-900/30 border border-red-800/50 text-red-200'
                                    }`}>
                                        {resetStatus.message}
                                    </div>
                                )}
                            </div>
                        </details>
                    </div>
                )}

                {/* Selektor daty */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 p-6">
                        <label htmlFor="date-selector" className="block text-lg font-semibold text-gray-300 mb-3">
                            Wybierz datę sesji:
                        </label>
                        <select
                            id="date-selector"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="w-full bg-zinc-800 border border-gray-600 rounded-lg px-4 py-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-barlow"
                        >
                            <option value="" className="font-barlow">-- Wybierz datę --</option>
                            {availableDates.map((dateGroup) => (
                                <option key={dateGroup.date} value={dateGroup.date} className="font-barlow">
                                    {dateGroup.displayDate} ({dateGroup.totalGames} {dateGroup.totalGames === 1 ? 'gra' : dateGroup.totalGames < 5 ? 'gry' : 'gier'})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Błąd */}
                {error && (
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-4 text-center">
                            <p className="text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Ładowanie danych */}
                {dataLoading && (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
                        <p className="text-gray-300">Ładowanie danych...</p>
                    </div>
                )}

                {/* Wyświetlanie danych hosta */}
                {hostInfo && !dataLoading && (
                    <div className="max-w-4xl mx-auto">
                        {/* Przycisk do podsumowania */}
                        <div className="text-center mb-6">
                            <a
                                href={buildSeasonUrl(`/historia-gier/${selectedDate}/podsumowanie`, seasonId)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg shadow transition-colors text-lg"
                            >
                                Przejdź do podsumowania
                            </a>
                        </div>

                        <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-zinc-800/80">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                #
                                            </th>
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                Gracz
                                            </th>
                                            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                Gry
                                            </th>
                                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                Suma Punktów
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-700/50">
                                        {hostInfo.players.map((player, index) => (
                                            <tr
                                                key={player.name}
                                                className="hover:bg-zinc-800/50 transition-colors"
                                            >
                                                <td className="px-6 py-4 text-gray-400 font-mono">
                                                    {index + 1}.
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                                            <Image
                                                                src={player.avatar}
                                                                alt={player.name}
                                                                width={40}
                                                                height={40}
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <span className="font-semibold text-lg">
                                                            {player.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center text-gray-300">
                                                    {player.games}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-xl font-bold text-white">
                                                        {player.totalPoints.toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Podsumowanie statystyk */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/50">
                                <div className="text-blue-300 text-sm uppercase tracking-wide mb-1">
                                    Gracze
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {hostInfo.players.length}
                                </div>
                            </div>
                            <div className="bg-green-900/30 rounded-lg p-4 border border-green-700/50">
                                <div className="text-green-300 text-sm uppercase tracking-wide mb-1">
                                    Średnia punktów
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {hostInfo.players.length > 0
                                        ? (hostInfo.players.reduce((sum, p) => sum + p.totalPoints, 0) / hostInfo.players.length).toFixed(1)
                                        : '0.0'}
                                </div>
                            </div>
                            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-700/50">
                                <div className="text-purple-300 text-sm uppercase tracking-wide mb-1">
                                    Najwyższy wynik
                                </div>
                                <div className="text-3xl font-bold text-white">
                                    {hostInfo.players.length > 0 ? hostInfo.players[0].totalPoints.toFixed(1) : '0.0'}
                                </div>
                            </div>
                        </div>

                        {/* Tabela zmian w rankingu */}
                        {hostInfo.rankingChanges.length > 0 && (
                            <div className="mt-12">
                                <div className="bg-zinc-900/70 rounded-xl border border-gray-700/50 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-zinc-800/80">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Gracz
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Stary Ranking
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Nowy Ranking
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300 uppercase tracking-wider">
                                                        Różnica
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700/50">
                                                {hostInfo.rankingChanges.map((change) => (
                                                    <tr
                                                        key={change.name}
                                                        className="hover:bg-zinc-800/50 transition-colors"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                                                                    <Image
                                                                        src={change.avatar}
                                                                        alt={change.name}
                                                                        width={40}
                                                                        height={40}
                                                                        className="object-cover"
                                                                    />
                                                                </div>
                                                                <span className="font-semibold text-lg">
                                                                    {change.name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-white font-bold text-lg">
                                                                    {Math.round(change.ratingBefore)}
                                                                </span>
                                                                <span className="text-gray-400 text-sm">
                                                                    #{change.rankBefore}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <span className="text-white font-bold text-lg">
                                                                    {Math.round(change.ratingAfter)}
                                                                </span>
                                                                <span className="text-gray-400 text-sm">
                                                                    #{change.rankAfter}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-xl font-bold ${
                                                                (change.ratingAfter - change.ratingBefore) > 0
                                                                    ? 'text-green-400'
                                                                    : (change.ratingAfter - change.ratingBefore) < 0
                                                                    ? 'text-red-400'
                                                                    : 'text-gray-400'
                                                            }`}>
                                                                {(change.ratingAfter - change.ratingBefore) > 0 ? '+' : ''}
                                                                {Math.round(change.ratingAfter) - Math.round(change.ratingBefore)}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
