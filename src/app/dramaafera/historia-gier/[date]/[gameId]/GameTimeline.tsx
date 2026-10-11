'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { UIGameEvent } from '../../../_services/games/types';
import { getPlayerAvatarPath } from '@/app/dramaafera/_utils/gameUtils';

const TARGET_ACTION_ICONS: Record<string, { name: string; icon: string }> = {
    douse: { name: 'Douse', icon: '/images/mira/abilities/DouseButton.png' },
    knight: { name: 'Knight', icon: '/images/mira/abilities/KnightButton.png' },
    infect: { name: 'Infect', icon: '/images/mira/abilities/InfectButton.png' },
};

export function GameTimeline({ events, endTimestamp }: { events: UIGameEvent[]; endTimestamp?: string }) {
    const [mode, setMode] = useState<'standard' | 'detailed'>('standard');
    const visibleEvents = mode === 'detailed' ? events : events.filter(event =>
        !['task_completed', 'round_survived', 'vote'].includes(event.actionType ?? '') &&
        !(event.actionType === undefined && (event.type === 'task' || event.type === 'vote'))
    );
    return (
                <div className="mb-8">
                    <h2 className="text-3xl font-brook font-bold mb-4">⏰ Przebieg gry</h2>
                    <div role="group" aria-label="Tryb przebiegu gry" className="flex gap-2 mb-4 font-barlow">
                        {([{ value: 'standard', label: 'Standardowy' }, { value: 'detailed', label: 'Szczegółowy' }] as const).map(option => (
                            <button
                                key={option.value}
                                type="button"
                                aria-pressed={mode === option.value}
                                onClick={() => setMode(option.value)}
                                className={`rounded-lg px-4 py-2 font-semibold border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 ${mode === option.value ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    {visibleEvents.length === 0 && (
                        <p className="text-gray-400">Brak zdarzeń do wyświetlenia w tym trybie.</p>
                    )}
                    <div className="space-y-3">
                        {visibleEvents.map((event, index) => {
                            const targetAbility = event.killAbility
                                ?? TARGET_ACTION_ICONS[event.actionType ?? '']
                                ?? (event.ability && ['Hex', 'Confess', 'Camp', 'Stalk', 'Jail'].includes(event.ability.name) ? event.ability : undefined);
                            return (
                            <div key={index} className={`bg-gray-800/50 rounded-lg p-4 border flex items-center gap-3 font-barlow ${event.isCorrect === true ? 'bg-[linear-gradient(rgba(34,197,94,0.04),rgba(34,197,94,0.04))] border-[#3b4842]/50' : event.isCorrect === false ? 'bg-[linear-gradient(rgba(239,68,68,0.04),rgba(239,68,68,0.04))] border-[#483b3e]/50' : 'border-gray-700/50'}`}>
                                {!event.hideTimestamp && <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded font-mono text-sm shrink-0 text-center">
                                    {event.timestamp}
                                </span>}
                                <div className="text-gray-300 min-w-0 flex-1 flex flex-wrap items-center gap-x-[0.25em] gap-y-2 break-words">
                                    {event.survivors ? (
                                        <>
                                            <span>Rundę przetrwali:</span>
                                            {event.survivors.map((survivor, survivorIndex) => (
                                                <span key={survivor.name} className="inline-flex items-center gap-2 min-w-0">
                                                    <Image src={getPlayerAvatarPath(survivor.name)} alt={`Avatar ${survivor.name}`} width={32} height={32} className="rounded-full shrink-0" />
                                                    <span>
                                                        <strong>{survivor.name}</strong>
                                                        {survivor.role && <> <strong style={{ color: survivor.color }}>({survivor.role})</strong></>}
                                                        {survivorIndex === (event.survivors?.length ?? 0) - 1 ? '.' : ','}
                                                    </span>
                                                </span>
                                            ))}
                                        </>
                                    ) : event.actionLabel ? (
                                        <>
                                            <span className="inline-flex items-center gap-2 min-w-0">
                                                <Image src={getPlayerAvatarPath(event.player)} alt={`Avatar ${event.player}`} width={32} height={32} className="rounded-full shrink-0" />
                                                <span>
                                                    <strong>{event.player}</strong>
                                                    {event.playerRole && <> <strong style={{ color: event.playerRoleColor }}>({event.playerRole})</strong></>}
                                                </span>
                                            </span>
                                            <span className={`inline-flex flex-wrap items-center gap-x-[0.25em] ${targetAbility ? 'mx-3' : ''}`}>
                                                {targetAbility ? (
                                                    <>
                                                        <Image src={targetAbility.icon} alt={targetAbility.name} title={targetAbility.name} width={32} height={32} className="shrink-0 object-contain" />
                                                        <span aria-label="w stronę" className="text-2xl font-bold leading-none">➜</span>
                                                    </>
                                                ) : event.ability?.name === 'Morph' && event.target ? (
                                                    <>
                                                        <Image src={event.ability.icon} alt="Morph" title="Morph" width={32} height={32} className="shrink-0 object-contain" />
                                                        <span>zmorphował się w</span>
                                                    </>
                                                ) : event.ability ? (
                                                    <>
                                                        <span>użył zdolności</span>
                                                        <Image src={event.ability.icon} alt={event.ability.name} title={event.ability.name} width={32} height={32} className="shrink-0 object-contain" />
                                                        <span>„{event.ability.name}”{!event.target && '.'}</span>
                                                    </>
                                                ) : <span>{event.actionLabel}{!event.target && '.'}</span>}
                                            </span>
                                            {event.target && (
                                                <span className="inline-flex items-center gap-2 min-w-0">
                                                    <Image src={getPlayerAvatarPath(event.target)} alt={`Avatar ${event.target}`} width={32} height={32} className="rounded-full shrink-0" />
                                                    <span>
                                                        <strong>{event.target}</strong>
                                                        {event.targetRole && <> <strong style={{ color: event.targetRoleColor }}>({event.targetRole})</strong></>}
                                                        .
                                                    </span>
                                                </span>
                                            )}
                                        </>
                                    ) : `${event.description.trimEnd().replace(/\.+$/, '')}.`}
                                    {event.isCorrect === true && (
                                        <span aria-label="Poprawna akcja" className="ml-2 text-green-400 font-bold text-xl leading-none">✓</span>
                                    )}
                                    {event.isCorrect === false && (
                                        <span aria-label="Niepoprawna akcja" className="ml-2 text-red-400 font-bold text-xl leading-none">✘</span>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 font-barlow text-gray-300 flex items-center gap-3">
                            {endTimestamp && <span className="bg-blue-600/30 text-blue-300 px-3 py-1 rounded font-mono text-sm shrink-0 text-center">{endTimestamp}</span>}
                            Koniec gry.
                        </div>
                    </div>
                </div>


    );
}
