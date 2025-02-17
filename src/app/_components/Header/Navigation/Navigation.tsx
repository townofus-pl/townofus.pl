'use client';

import Image from "next/image";
import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname} from "next/navigation";
import {Menu, ExternalLink} from "@deemlol/next-icons";
import {NavigationItem, type NavigationItemProps} from "./NavigationItem";
import {NavigationLabel} from "./NavigationLabel";

const navigationItems: NavigationItemProps[] = [
    {
        href: "/",
        label: "Start"
    },
    {
        href: "/tajemniczy",
        label: "Dymowy Among"
    },
    {
        href: "https://github.com/townofus-pl/AleLuduMod/tree/main?tab=readme-ov-file",
        label: "AleLuduMod",
        image: (
            <ExternalLink className="w-5 h-5"/>
        ),
        external: true,
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

    const menuListClassNames = useMemo(() => {
        const classNames = [
            'font-barlow',
            'overflow-hidden',
            'flex-col',
            'md:flex-row',
            'gap-2',
            'md:flex'
        ];

        if (mobileMenuOpened) {
            classNames.push('flex');
        } else {
            classNames.push('hidden');
        }

        return classNames.join(' ');
    }, [mobileMenuOpened]);

    // close menu on path change (page reload)
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
                    selected={true}
                />
            </div>
            <ul className={menuListClassNames}>
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
