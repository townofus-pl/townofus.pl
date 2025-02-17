'use client';

import Image from "next/image";
import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname} from "next/navigation";
import {Menu} from "@deemlol/next-icons";
import {NavigationItem, type NavigationItemProps} from "./NavigationItem";
import {NavigationLabel} from "./NavigationLabel";

const navigationItems: NavigationItemProps[] = [
    {
        href: "/",
        label: "Start"
    },
    {
        href: "/tajemniczy",
        label: "Tajemniczy"
    },
    {
        href: "/lobby-15-plus",
        label: "Lobby dla 15+ graczy"
    },
    {
        href: 'https://discord.townofus.pl',
        label: 'Discord',
        image: (
            <div className="px-0.5 py-1 bg-discord-blurple rounded drop-shadow-md">
                <Image src="/images/discord-logo.svg" alt="Discord" width={127} height={96}/>
            </div>
        ),
        external: true,
    },
    {
        href: 'https://github.townofus.pl',
        label: 'GitHub',
        image: (
            <div className="px-0.5 py-0.5 bg-white rounded drop-shadow-md">
                <Image src="/images/github-logo.svg" alt="GitHub" width={98} height={96}/>
            </div>
        ),
        external: true,
    },
];

export const Navigation = () => {
    const currentPath = usePathname();
    const currentPage = useMemo(
        () => navigationItems.find(({href}) => currentPath === href) || navigationItems[0],
        [currentPath]
    );
    const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
    const toggleMenu = useCallback(() => setMobileMenuOpened(prev => !prev), []);

    const listClassNames = useMemo(() => [
        'font-barlow',
        'overflow-hidden',
        'flex-col',
        'md:flex-row',
        'gap-2',
        'md:gap-0',
        mobileMenuOpened ? 'flex' : 'hidden',
        'md:flex'
    ], [mobileMenuOpened]);

    useEffect(() => {
        setMobileMenuOpened(false);
    }, [currentPath])

    return (
        <nav className="flex flex-col ml-0 md:-ml-3">
            <div
                className="flex flex-row gap-2 items-center text-lg cursor-pointer mb-2 md:hidden"
                onClick={toggleMenu}
            >
                <Menu className="w-7 h-7 p-1 border-2 border-foreground rounded-2xl"/>
                <NavigationLabel
                    label={currentPage.label}
                    image={currentPage.image}
                    selected={currentPage.selected}
                />
            </div>
            <ul className={listClassNames.join(' ')}>
                {navigationItems.map(({href, label, image, external}) => (
                    <NavigationItem
                        key={href}
                        href={href}
                        label={label}
                        image={image}
                        external={external}
                        selected={currentPath === href}
                    />
                ))}
            </ul>
        </nav>
    );
}
