'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { AvatarImageFill } from '@/app/dramaafera/_components/PodsumowanieClient/AvatarImage';
import {
  getGameSessionLists,
  saveGameSessionList,
  deleteGameSessionList,
  getGameSessionListById,
  getPlayerPickerData,
  checkNewPlayerNames,
} from '@/app/dramaafera/_actions/listaCweliActions';
import { matchesSearch } from '@/app/dramaafera/_utils/textMatch';
import type { GameSessionListSummary, PlayerPickerData } from '@/app/dramaafera/_services/gameSessionList/types';

interface ListaCweliTabProps {
  seasonId: number;
}

// null = similar existing name found, awaiting the host's explicit choice.
type NameResolution = { status: 'new' } | { status: 'use-existing'; existingName: string };

const EMPTY_PICKER_DATA: PlayerPickerData = { seasonPlayers: [], otherPlayers: [] };

function parseNames(text: string): string[] {
  return Array.from(new Set(text.split(/[\n;]/).map((n) => n.trim()).filter(Boolean)));
}

interface AddPlayerDialogProps {
  otherPlayers: PlayerPickerData['otherPlayers'];
  alreadySelected: Set<string>;
  onClose: () => void;
  onConfirm: (existingNames: string[], newNames: string[]) => void;
}

function AddPlayerDialog({ otherPlayers, alreadySelected, onClose, onConfirm }: AddPlayerDialogProps) {
  const [search, setSearch] = useState('');
  const [checkedExisting, setCheckedExisting] = useState<Set<string>>(new Set());
  const [newNamesInput, setNewNamesInput] = useState('');
  const [checkResults, setCheckResults] = useState<Array<{ candidate: string; similarTo: string | null }> | null>(
    null
  );
  const [resolutions, setResolutions] = useState<Record<string, NameResolution | null>>({});
  const [isChecking, setIsChecking] = useState(false);

  const availablePlayers = useMemo(
    () => otherPlayers.filter((p) => !alreadySelected.has(p.name) && matchesSearch(p.name, search)),
    [otherPlayers, alreadySelected, search]
  );

  const toggleExisting = useCallback((name: string) => {
    setCheckedExisting((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleCheckNewNames = useCallback(async () => {
    const parsed = parseNames(newNamesInput);
    if (parsed.length === 0) {
      onConfirm(Array.from(checkedExisting), []);
      return;
    }

    setIsChecking(true);
    const results = await checkNewPlayerNames(parsed);
    setIsChecking(false);

    setCheckResults(results);
    setResolutions(
      results.reduce<Record<string, NameResolution | null>>((acc, { candidate, similarTo }) => {
        acc[candidate] = similarTo ? null : { status: 'new' };
        return acc;
      }, {})
    );
  }, [newNamesInput, checkedExisting, onConfirm]);

  const allResolved = checkResults !== null && checkResults.every((r) => resolutions[r.candidate] != null);

  const handleFinalConfirm = useCallback(() => {
    if (!checkResults) return;
    const newNames: string[] = [];
    const existingFromResolution: string[] = [];
    for (const { candidate } of checkResults) {
      const resolution = resolutions[candidate];
      if (resolution?.status === 'new') newNames.push(candidate);
      if (resolution?.status === 'use-existing') existingFromResolution.push(resolution.existingName);
    }
    onConfirm([...Array.from(checkedExisting), ...existingFromResolution], newNames);
  }, [checkResults, resolutions, checkedExisting, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-brook text-white">Dodaj gracza</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Wybierz istniejącego gracza
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj..."
            className="w-full px-3 py-2 mb-3 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none"
          />
          <div className="max-h-56 overflow-y-auto space-y-1">
            {availablePlayers.map((p) => (
              <label
                key={p.name}
                className="flex items-center gap-3 p-2 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={checkedExisting.has(p.name)}
                  onChange={() => toggleExisting(p.name)}
                  className="w-4 h-4 accent-yellow-500"
                />
                <span className="text-sm text-zinc-200">{p.name}</span>
              </label>
            ))}
            {availablePlayers.length === 0 && (
              <p className="text-sm text-zinc-500 p-2">Brak graczy do wyboru</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-300 mb-2">
            Dodaj nowych graczy (jeden na linię lub oddzieleni średnikiem)
          </label>
          <textarea
            value={newNamesInput}
            onChange={(e) => {
              setNewNamesInput(e.target.value);
              setCheckResults(null);
              setResolutions({});
            }}
            placeholder="nick1; nick2; nick3"
            className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none resize-none h-20"
          />
        </div>

        {checkResults && checkResults.length > 0 && (
          <div className="space-y-2">
            {checkResults.map(({ candidate, similarTo }) => {
              if (!similarTo || resolutions[candidate] != null) return null;
              return (
                <div key={candidate} className="p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                  <p className="text-sm text-yellow-300 mb-2">
                    Podobny gracz już istnieje: <strong>{similarTo}</strong> — czy to ten sam gracz jako{' '}
                    <strong>{candidate}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setResolutions((prev) => ({
                          ...prev,
                          [candidate]: { status: 'use-existing', existingName: similarTo },
                        }))
                      }
                      className="px-3 py-1.5 text-xs bg-yellow-700 hover:bg-yellow-600 text-white rounded"
                    >
                      Użyj &quot;{similarTo}&quot;
                    </button>
                    <button
                      onClick={() => setResolutions((prev) => ({ ...prev, [candidate]: { status: 'new' } }))}
                      className="px-3 py-1.5 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded"
                    >
                      To nowy gracz, dodaj mimo to
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-3">
          {checkResults === null ? (
            <button
              onClick={handleCheckNewNames}
              disabled={isChecking}
              className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              {isChecking ? 'Sprawdzanie...' : 'Dalej'}
            </button>
          ) : (
            <button
              onClick={handleFinalConfirm}
              disabled={!allResolved}
              className="flex-1 px-4 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Dodaj do listy
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-semibold rounded-lg transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ListaCweliTab({ seasonId }: ListaCweliTabProps) {
  const [savedLists, setSavedLists] = useState<GameSessionListSummary[]>([]);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [pickerData, setPickerData] = useState<PlayerPickerData>(EMPTY_PICKER_DATA);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [pendingNewNames, setPendingNewNames] = useState<Set<string>>(new Set());
  const [mainSearch, setMainSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!message || message.type !== 'success') return;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const load = async () => {
      const data = await getPlayerPickerData(seasonId);
      setPickerData(data);
    };
    load();
  }, [seasonId]);

  useEffect(() => {
    const loadLists = async () => {
      const lists = await getGameSessionLists(seasonId);
      setSavedLists(lists);
    };
    loadLists();
  }, [seasonId]);

  useEffect(() => {
    if (selectedListId === null) {
      setSelectedNames(new Set());
      setPendingNewNames(new Set());
      setEditingListId(null);
      return;
    }

    const loadList = async () => {
      const list = await getGameSessionListById(selectedListId);
      if (list) {
        setEditingListId(list.id);
        setSelectedDate(list.date.toISOString().split('T')[0]);
        setSelectedNames(new Set(list.playerNames));
        setPendingNewNames(new Set());
      }
    };
    loadList();
  }, [selectedListId]);

  const seasonPlayerNameSet = useMemo(
    () => new Set(pickerData.seasonPlayers.map((p) => p.name)),
    [pickerData]
  );

  const filteredSeasonPlayers = useMemo(
    () => pickerData.seasonPlayers.filter((p) => matchesSearch(p.name, mainSearch)),
    [pickerData.seasonPlayers, mainSearch]
  );

  // "Dodani gracze": drafted names with no game this season — derived from the selection,
  // not a separate DB query, so it re-splits automatically once a player's first game lands.
  const addedPlayerNames = useMemo(
    () =>
      Array.from(selectedNames)
        .filter((name) => !seasonPlayerNameSet.has(name))
        .sort((a, b) => a.localeCompare(b, 'pl-PL')),
    [selectedNames, seasonPlayerNameSet]
  );

  const handleToggle = useCallback((name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const handleRemoveAdded = useCallback((name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
    setPendingNewNames((prev) => {
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }, []);

  const handleDialogConfirm = useCallback((existingNames: string[], newNames: string[]) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      existingNames.forEach((n) => next.add(n));
      newNames.forEach((n) => next.add(n));
      return next;
    });
    setPendingNewNames((prev) => {
      const next = new Set(prev);
      newNames.forEach((n) => next.add(n));
      return next;
    });
    setIsDialogOpen(false);
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedDate) {
      setMessage({ type: 'error', text: 'Wybierz datę' });
      return;
    }

    if (selectedNames.size === 0) {
      setMessage({ type: 'error', text: 'Dodaj co najmniej jednego gracza' });
      return;
    }

    setIsSaving(true);
    const result = await saveGameSessionList(
      seasonId,
      new Date(selectedDate),
      Array.from(selectedNames),
      editingListId || undefined,
      Array.from(pendingNewNames)
    );

    if (result) {
      setMessage({
        type: 'success',
        text: editingListId ? 'Lista została zaktualizowana' : 'Lista została zapisana',
      });

      const [lists, freshPickerData] = await Promise.all([
        getGameSessionLists(seasonId),
        getPlayerPickerData(seasonId),
      ]);
      setSavedLists(lists);
      setPickerData(freshPickerData);

      setSelectedNames(new Set());
      setPendingNewNames(new Set());
      setSelectedListId(null);
      setEditingListId(null);
    } else {
      setMessage({ type: 'error', text: 'Błąd przy zapisywaniu listy' });
    }

    setIsSaving(false);
  }, [seasonId, selectedDate, selectedNames, pendingNewNames, editingListId]);

  const handleDelete = useCallback(
    async (listId: number) => {
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
    },
    [seasonId]
  );

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
          <label className="block text-sm font-semibold text-zinc-300 mb-3">Zapisane listy</label>
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
        <label className="block text-sm font-semibold text-zinc-300 mb-3">Data sesji</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full px-3 py-2 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none"
        />
      </div>

      <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
        <div className="flex justify-between items-center mb-4">
          <label className="block text-sm font-semibold text-zinc-300">Gracze sezonu</label>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-3 py-1.5 text-sm bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
          >
            + Dodaj gracza
          </button>
        </div>
        <input
          type="text"
          value={mainSearch}
          onChange={(e) => setMainSearch(e.target.value)}
          placeholder="Szukaj..."
          className="w-full px-3 py-2 mb-4 bg-zinc-800 text-white border border-zinc-600 rounded-lg focus:border-yellow-500 focus:outline-none"
        />
        {filteredSeasonPlayers.length === 0 ? (
          <p className="text-sm text-zinc-500">
            {pickerData.seasonPlayers.length === 0
              ? 'Brak graczy z rozgrywkami w tym sezonie — użyj przycisku "Dodaj gracza".'
              : 'Brak wyników wyszukiwania.'}
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filteredSeasonPlayers.map((p) => (
              <label
                key={p.name}
                className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-600 hover:border-yellow-500 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0 w-12 h-12 relative rounded overflow-hidden bg-zinc-700">
                  <AvatarImageFill nickname={p.name} className="object-cover" />
                </div>
                <span className="flex-1 text-sm font-medium text-zinc-200 min-w-0 truncate">{p.name}</span>
                <input
                  type="checkbox"
                  checked={selectedNames.has(p.name)}
                  onChange={() => handleToggle(p.name)}
                  className="flex-shrink-0 w-5 h-5 cursor-pointer accent-yellow-500"
                />
              </label>
            ))}
          </div>
        )}
      </div>

      {addedPlayerNames.length > 0 && (
        <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-700">
          <label className="block text-sm font-semibold text-zinc-300 mb-4">Dodani gracze</label>
          <div className="grid grid-cols-3 gap-3">
            {addedPlayerNames.map((name) => (
              <label
                key={name}
                className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-600 hover:border-yellow-500 cursor-pointer transition-colors"
              >
                <span className="flex-1 text-sm font-medium text-zinc-200 min-w-0 truncate">{name}</span>
                <input
                  type="checkbox"
                  checked
                  onChange={() => handleRemoveAdded(name)}
                  className="flex-shrink-0 w-5 h-5 cursor-pointer accent-yellow-500"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700">
        <div className="text-sm text-blue-300 font-semibold">Razem: {selectedNames.size} graczy</div>
      </div>

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

      {isDialogOpen && (
        <AddPlayerDialog
          otherPlayers={pickerData.otherPlayers}
          alreadySelected={selectedNames}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleDialogConfirm}
        />
      )}
    </div>
  );
}
