'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Identity {
    username: string;
    avatarUrl: string | null;
}

export default function AccountLink() {
    const pathname = usePathname();
    const [identity, setIdentity] = useState<Identity | null>(null);

    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const refresh = async () => {
            try {
                const response = await fetch('/dramaafera/auth/session', {
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (!response.ok) return;
                const result = (await response.json()) as { data: Identity | null };
                if (active) setIdentity(result.data);
            } catch {
                /* Leave the account entry available when the connection fails. */
            }
        };
        void refresh();
        window.addEventListener('focus', refresh);
        window.addEventListener('dramaafera-account-change', refresh);
        return () => {
            active = false;
            controller.abort();
            window.removeEventListener('focus', refresh);
            window.removeEventListener('dramaafera-account-change', refresh);
        };
    }, [pathname]);

    return (
        <Link
            href="/dramaafera/konto"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
            {identity ? (
                <>
                    {identity.avatarUrl ? (
                        <Image
                            src={identity.avatarUrl}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-full"
                            unoptimized
                        />
                    ) : (
                        <span
                            aria-hidden="true"
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 font-semibold"
                        >
                            {identity.username.slice(0, 1).toUpperCase()}
                        </span>
                    )}
                    <span>{identity.username}</span>
                </>
            ) : (
                'Zaloguj się'
            )}
        </Link>
    );
}
