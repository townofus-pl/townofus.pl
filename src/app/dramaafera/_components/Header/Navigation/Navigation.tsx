'use client';

import Image from "next/image";
import {useCallback, useEffect, useMemo, useState} from "react";
import {usePathname} from "next/navigation";
import {Menu} from "@deemlol/next-icons";
import {NavigationItem, type NavigationItemProps} from "./NavigationItem";
import {NavigationLabel} from "./NavigationLabel";

const navigationItems: NavigationItemProps[] = [
    {
        href: "/dramaafera",
        label: "Ustawienia"
    },
    {
        href: "/dramaafera/ranking",
        label: "Ranking"
    },
    {   
        href: "/dramaafera/historia-gier",
        label: "Historia Gier",

    },
    {   
        href: "/dramaafera/informacje",
        label: "Informacje",

    },
    {   
        href: "/dramaafera/skiny",
        label: "Skiny Drama Afera",

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
