import type {FC, ReactNode} from "react";
import Link from "next/link";
import {NavigationLabel} from "./NavigationLabel";

export type NavigationItemProps = {
    href: string;
    label: string;
    image?: ReactNode;
    external?: boolean;
    selected?: boolean;
};

export const NavigationItem: FC<NavigationItemProps> = ({href, label, image, external, selected}) => (
    <li className={`${selected ? "hidden" : "flex"}`}>
        <Link
            className="flex items-center gap-1.5 ml-8 px-1.5 py-1 md:ml-0 md:px-3 md:py-2 hover:bg-zinc-700 transition-colors duration-300 rounded-lg"
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer noopener" : undefined}
        >
            <NavigationLabel label={label} image={image} selected={selected}/>
        </Link>
    </li>
);
