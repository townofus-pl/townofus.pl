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
        href: "/instalacja-tou",
        label: "Instalacja ToU"
    },
    {
        href: "/lobby-15-plus",
        label: "AleLuduMod",
        /*badge: (
            <span className="ml-2 text-yellow-400 font-bold drop-shadow-[0_0_4px_rgba(250,204,21,0.7)]">
                UPDATE!
            </span> 
        )*/
    },
     {
        href: "/susmodder",
        label: "Susmodder",
        badge: (
            <span className="ml-2 text-red-500 font-bold drop-shadow-[0_0_4px_rgba(250,0,0,0.7)]">
                NOWOŚĆ!
            </span> 
        )
    },
    {
        href: '/discord',
        label: 'Discord',
        image: (
            <div className="px-0.5 py-1 rounded drop-shadow-md">
                <Image src="/images/discord-logo.svg" alt="Discord" width={127} height={96}/>
            </div>
        ),
    },
    {
        href: 'https://github.townofus.pl',
        label: 'GitHub',
        image: (
            <div className="px-0.5 py-0.5 rounded drop-shadow-md">
                <Image src="/images/github-logo.svg" alt="GitHub" width={98} height={96}/>
            </div>
        ),
        external: true,
    },
    /*{
        href: "/tajemniczy",
        label: "Dymowy Among"
    }*/
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
                {navigationItems.map(({href, label, image, external, badge}) => (
                    <NavigationItem
                        key={href}
                        href={href}
                        label={label}
                        image={image}
                        external={external}
                        badge={badge}
                        selected={currentPath === href}
                    />
                ))}
            </ul>
        </nav>
    );
}
