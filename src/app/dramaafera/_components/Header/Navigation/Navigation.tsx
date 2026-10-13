'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu } from '@deemlol/next-icons';
import { NavigationItem, type NavigationItemProps } from './NavigationItem';
import { NavigationLabel } from './NavigationLabel';
import { useSeason } from '../../../_hooks/useSeason';
import { buildSeasonUrl, extractDramaAferaSubPath } from '../../../_utils/seasonHelpers';

type NavigationItemConfig = NavigationItemProps & {
    /** Czy link zależy od sezonu (zyskuje prefiks /sezon/{id}/ dla nie-bieżących sezonów) */
    seasonDependent: boolean;
    /** Ścieżka bazowa (bez /dramaafera), używana do wykrywania aktywnej strony */
    subPath: string;
};

const navigationItemConfigs: NavigationItemConfig[] = [
    {
        subPath: '/',
        href: '/dramaafera',
        label: 'Ustawienia',
        seasonDependent: false,
    },
    {
        subPath: '/changelog',
        // Jeden adres dla obu er — /changelog sam wybiera widok po formacie wgranego pliku.
        // W URL-ach nie ma "mira". Zob. #317.
        href: '/dramaafera/changelog',
        label: 'Changelog',
        seasonDependent: false,
    },
    {
        subPath: '/ranking',
        href: '/dramaafera/ranking',
        label: 'Ranking',
        seasonDependent: true,
    },
    {
        subPath: '/wyniki',
        href: '/dramaafera/wyniki',
        label: 'Wyniki Dnia',
        seasonDependent: true,
    },
    { subPath: '/zapisy', href: '/dramaafera/zapisy', label: 'Zapisy', seasonDependent: false },
    {
        subPath: '/historia-gier',
        href: '/dramaafera/historia-gier',
        label: 'Historia Gier',
        seasonDependent: true,
    },
    {
        subPath: '/playlista',
        href: '/dramaafera/playlista',
        label: 'Playlista',
        seasonDependent: false,
    },
    {
        subPath: '/informacje',
        href: '/dramaafera/informacje',
        label: 'Informacje',
        seasonDependent: false,
    },
    {
        subPath: '/do_pobrania',
        href: '/dramaafera/do_pobrania',
        label: 'Do Pobrania',
        seasonDependent: false,
    },
    { subPath: '/host', href: '/dramaafera/host', label: 'Host', seasonDependent: false },
];

export const Navigation = () => {
    const currentPath = usePathname();
    const [isHost, setIsHost] = useState(false);
    useEffect(() => {
        let active = true;
        const controller = new AbortController();
        const refresh = async () => {
            try {
                const response = await fetch('/dramaafera/host/access', {
                    cache: 'no-store',
                    signal: controller.signal,
                });
                if (!response.ok) {
                    if (active) setIsHost(false);
                    return;
                }
                const result = (await response.json()) as { isHost: boolean };
                if (active) setIsHost(result.isHost === true);
            } catch {
                if (active) setIsHost(false);
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
    }, [currentPath]);
    const seasonId = useSeason();
    const currentSubPath = extractDramaAferaSubPath(currentPath);

    // Wyznaczamy aktywną stronę porównując sub-ścieżki (prefiks) zamiast pełnych URLi.
    // Dzięki temu /historia-gier jest aktywne również na /historia-gier/2026-03-12 itd.
    const currentPage = useMemo(() => {
        const match = navigationItemConfigs.find(({ subPath }) => {
            if (subPath === '/') return currentSubPath === '/';
            return currentSubPath === subPath || currentSubPath.startsWith(subPath + '/');
        });
        return match ?? navigationItemConfigs[0];
    }, [currentSubPath]);

    // Budujemy właściwe href z uwzględnieniem aktywnego sezonu.
    // Aktywny element wyznaczamy po subPath (prefix match), więc `selected` porównuje subPath.
    const navigationItems: (NavigationItemProps & { subPath: string })[] = useMemo(
        () =>
            navigationItemConfigs
                .filter((item) => item.subPath !== '/host' || isHost)
                .map(({ subPath, seasonDependent, ...rest }) => ({
                    ...rest,
                    subPath,
                    href: seasonDependent ? buildSeasonUrl(subPath, seasonId) : rest.href,
                })),
        [seasonId, isHost],
    );

    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
    const toggleMenu = useCallback(() => setMobileMenuOpened((prev) => !prev), []);

    const menuListClassNames = useMemo(() => {
        const classNames = [
            'font-barlow',
            'overflow-hidden',
            'flex-col',
            'md:flex-row',
            'md:flex-wrap',
            'gap-2',
            'md:flex',
        ];

        if (mobileMenuOpened) {
            classNames.push('flex');
        } else {
            classNames.push('hidden');
        }

        return classNames.join(' ');
    }, [mobileMenuOpened]);

    // Zamknij menu przy zmianie strony
    useEffect(() => {
        setMobileMenuOpened(false);
    }, [currentPath]);

    return (
        <nav className="flex flex-col ml-0 md:-ml-3">
            <div
                className="flex flex-row gap-2 items-center text-lg cursor-pointer mb-2 md:hidden"
                onClick={toggleMenu}
            >
                <Menu className="w-7 h-7 p-1 border-2 border-foreground rounded-2xl" />
                <NavigationLabel
                    label={currentPage.label}
                    image={currentPage.image}
                    selected={true}
                />
            </div>
            <ul className={menuListClassNames}>
                {navigationItems.map((item) => (
                    <NavigationItem
                        key={item.href}
                        href={item.href}
                        label={item.label}
                        image={item.image}
                        external={item.external}
                        selected={item.subPath === currentPage.subPath}
                    />
                ))}
            </ul>
        </nav>
    );
};
