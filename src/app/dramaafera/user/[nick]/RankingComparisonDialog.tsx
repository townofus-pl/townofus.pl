'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { getPlayerAvatarPath } from '../../_utils/gameUtils';

export function RankingComparisonDialog({ playerNames, selected, onApply, onClose }: {
  playerNames: string[];
  selected: string[];
  onApply: (names: string[]) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [checked, setChecked] = useState(new Set(selected));
  const [search, setSearch] = useState('');
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  const available = playerNames.filter(name => name.toLocaleLowerCase('pl').includes(search.toLocaleLowerCase('pl')));

  return (
    <dialog ref={dialog} onCancel={onClose} aria-labelledby="rankingComparisonTitle"
      className="m-auto w-[calc(100%-2rem)] max-w-lg max-h-[85vh] rounded-xl border border-zinc-700 bg-zinc-900 p-6 text-white font-barlow backdrop:bg-black/70 backdrop:backdrop-blur-md"
      onClick={event => { if (event.target === event.currentTarget) {
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      } }}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 id="rankingComparisonTitle" className="font-brook text-xl">Porównaj z graczem</h3>
        <button type="button" onClick={onClose} aria-label="Zamknij" className="text-2xl text-zinc-400 hover:text-white">×</button>
      </div>
      <input type="search" aria-label="Szukaj gracza" placeholder="Szukaj gracza…" value={search} onChange={e => setSearch(e.target.value)}
        className="mb-3 w-full rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-2 focus:outline-none focus:border-yellow-500" />
      <div className="max-h-[45vh] overflow-y-auto space-y-1">
        {available.map(name => (
          <label key={name} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 p-3 hover:bg-zinc-800 cursor-pointer">
            <input type="checkbox" checked={checked.has(name)} className="h-4 w-4 accent-yellow-500"
              onChange={() => setChecked(previous => {
                const next = new Set(previous);
                if (next.has(name)) next.delete(name); else next.add(name);
                return next;
              })} />
            <Image src={getPlayerAvatarPath(name)} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
            <span>{name}</span>
          </label>
        ))}
        {available.length === 0 && <p className="p-3 text-zinc-400">Brak graczy do wyboru.</p>}
      </div>
      <div className="mt-5 flex justify-between items-center gap-3">
        <button type="button" onClick={() => setChecked(new Set())} className="text-sm text-zinc-400 hover:text-white">Odznacz wszystkich</button>
        <button type="button" onClick={() => onApply(playerNames.filter(name => checked.has(name)))}
          className="rounded-lg bg-yellow-500 px-4 py-2 font-semibold text-black hover:bg-yellow-400">Zastosuj ({checked.size})</button>
      </div>
    </dialog>
  );
}
