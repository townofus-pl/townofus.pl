"use client";
import {Header} from "./_components";
import {usePathname} from "next/navigation";

export function HeaderConditional() {
    const pathname = usePathname();
    if (pathname.includes("dramaafera")) return null;
    return <Header />;
}
