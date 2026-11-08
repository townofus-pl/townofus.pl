'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

export default function ReviewModal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
    const ref = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    useEffect(() => {
        const dialog = ref.current!;
        const overflow = document.body.style.overflow;
        dialog.showModal();
        document.body.style.overflow = 'hidden';
        return () => { dialog.close(); document.body.style.overflow = overflow; };
    }, []);
    return <dialog ref={ref} aria-labelledby={titleId} onCancel={event => { event.preventDefault(); onClose(); }}
        className="m-auto max-h-[85dvh] w-[calc(100%-2rem)] max-w-4xl overflow-y-auto rounded-xl border border-zinc-600 bg-zinc-900 p-0 font-barlow text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-zinc-700 bg-zinc-900 p-5">
            <h2 id={titleId} className="font-brook text-2xl text-yellow-300">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Zamknij okno" className="rounded-lg px-3 py-2 text-2xl hover:bg-zinc-700">×</button>
        </div>
        <div className="p-5">{children}</div>
    </dialog>;
}
