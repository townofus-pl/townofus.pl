'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  getGameSessionLists,
  saveGameSessionList,
  deleteGameSessionList,
  getGameSessionListById,
} from '@/app/dramaafera/_actions/gameSessionListActions';
import type { GameSessionListSummary } from '@/app/dramaafera/_services/gameSessionList/types';

interface ListaCweliTabProps {
  seasonId: number;
  availableAvatars: string[];
}

export default function ListaCweliTab({ seasonId, availableAvatars }: ListaCweliTabProps) {
  const [savedLists, setSavedLists] = useState<GameSessionListSummary[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedPlayerNames, setSelectedPlayerNames] = useState<Set<string>>(new Set());
  const [manualPlayersText, setManualPlayersText] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const loadLists = async () => {
      const lists = await getGameSessionLists(seasonId);
      setSavedLists(lists);
    };
    loadLists();
  }, [seasonId]);

  useEffect(() => {
    if (selectedListId === null) {
      setSelectedPlayerNames(new Set());
      setManualPlayersText('');
      setEditingListId(null);
      return;
    }

    const loadList = async () => {
      const list = await getGameSessionListById(selectedListId);
      if (list) {
        setEditingListId(list.id);
        setSelectedDate(list.date.toISOString().split('T')[0]);
        const avatarPlayers = list.playerNames.filter((name) =>
          availableAvatars.includes(name)
        );
        const manualPlayers = list.playerNames.filter(
          (name) => !availableAvatars.includes(name)
        );
        setSelectedPlayerNames(new Set(avatarPlayers));
        setManualPlayersText(manualPlayers.join('; '));
      }
    };
    loadList();
  }, [selectedListId, availableAvatars]);

  const handlePlayerToggle = useCallback((playerName: string) => {
    setSelectedPlayerNames((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerName)) {
        newSet.delete(playerName);
      } else {
        newSet.add(playerName);
      }
      return newSet;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedDate) {
      setMessage({ type: 'error', text: 'Wybierz datę' });
      return;
    }

    if (selectedPlayerNames.size === 0 && !manualPlayersText.trim()) {
      setMessage({ type: 'error', text: 'Dodaj co najmniej jednego gracza' });
      return;
    }

    const manualPlayers = manualPlayersText
      .split(';')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    const allPlayers = Array.from(selectedPlayerNames).concat(manualPlayers);

    setIsSaving(true);
    const result = await saveGameSessionList(
      seasonId,
      new Date(selectedDate),
      allPlayers,
      editingListId || undefined
    );

    if (result) {
      setMessage({
        type: 'success',
        text: editingListId ? 'Lista została zaktualizowana' : 'Lista została zapisana',
      });

      const lists = await getGameSessionLists(seasonId);
      setSavedLists(lists);

      setSelectedPlayerNames(new Set());
      setManualPlayersText('');
      setSelectedListId(null);
      setEditingListId(null);
    } else {
      setMessage({ type: 'error', text: 'Błąd przy zapisywaniu listy' });
    }

    setIsSaving(false);
  }, [seasonId, selectedDate, selectedPlayerNames, manualPlayersText, editingListId]);

  const handleDelete = useCallback(async (listId: number) => {
    if (!confirm('Czy na pewno chcesz usunąć tę listę?')) return;

    const success = await deleteGameSessionList(listId);
    if (success) {
      setMessage({ type: 'success', text: 'Lista została usunięta' });
      const lists = await getGameSessionLists(seasonId);
      setSavedLists(lists);
      setSelectedListId(null);
    } else {
      setMessage({ type: 'error', text: 'Błąd przy usuwaniu listy' });
    }
  }, [seasonId]);

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-400 border border-green-700'
              : 'bg-red-900/30 text-red-400 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      {savedLists.length > 0 && (
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
          <label className="block text-sm font-semibold text-zinc-300 mb-3">
            Zapisane listy
          </label>
          <select
            value={selectedListId ?? ''}
            onChange={(e) => {
              const id = e.target.value ? parseInt(e.target.value, 10) : null;
              setSelectedListId(id);
            }}
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none"
          >
            <option value="">-- Nowa lista --</option>
            {savedLists.map((list) => (
              <option key={list.id} value={list.id}>
                {list.dateFormatted} ({list.playerCount} graczy)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
        <label className="block text-sm font-semibold text-zinc-300 mb-3">
          Data sesji
        </label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none"
        />
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
        <label className="block text-sm font-semibold text-zinc-300 mb-4">
          Gracze z avatarów
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {availableAvatars.map((playerName) => (
            <label
              key={playerName}
              className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-600 hover:border-yellow-500 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedPlayerNames.has(playerName)}
                onChange={() => handlePlayerToggle(playerName)}
                className="w-4 h-4 cursor-pointer"
              />
              <span className="text-sm text-zinc-300">{playerName}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
        <label className="block text-sm font-semibold text-zinc-300 mb-3">
          Gracze bez avataru (oddzieleni średnikami)
        </label>
        <textarea
          value={manualPlayersText}
          onChange={(e) => setManualPlayersText(e.target.value)}
          placeholder="nick1; nick2; nick3"
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none resize-none h-20"
        />
      </div>

      {(selectedPlayerNames.size > 0 || manualPlayersText.trim()) && (
        <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
          <div className="text-sm text-blue-300">
            <strong>Podsumowanie:</strong>
            <ul className="mt-2 space-y-1">
              {Array.from(selectedPlayerNames).map((name) => (
                <li key={name}>• {name}</li>
              ))}
              {manualPlayersText
                .split(';')
                .map((name) => name.trim())
                .filter((name) => name.length > 0)
                .map((name) => (
                  <li key={name}>• {name}</li>
                ))}
            </ul>
            <div className="mt-3 text-blue-400 font-semibold">
              Razem: {selectedPlayerNames.size + manualPlayersText.split(';').filter((n) => n.trim()).length}{' '}
              graczy
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
        >
          {isSaving ? 'Zapisywanie...' : editingListId ? 'Aktualizuj' : 'Zapisz'}
        </button>
        {editingListId && (
          <button
            onClick={() => handleDelete(editingListId)}
            className="px-4 py-3 bg-red-900 hover:bg-red-800 text-white font-semibold rounded-lg transition-colors"
          >
            Usuń
          </button>
        )}
      </div>
    </div>
  );
}
