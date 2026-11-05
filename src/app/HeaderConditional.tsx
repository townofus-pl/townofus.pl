"use client";
import {Header} from "./_components";
import {usePathname} from "next/navigation";

export function HeaderConditional() {
    const pathname = usePathname();
    // Strony DramaAfera i dokumentacja API mają własny nagłówek DramaAfera.
    if (pathname.includes("dramaafera") || pathname.startsWith("/api/docs")) return null;
    return <Header />;
}
