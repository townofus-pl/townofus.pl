import type { Metadata } from "next";
import { formatDisplayDate } from "@/app/dramaafera/_utils/gameUtils";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { DateGamesContent } from "./DateGamesContent";

interface DatePageProps {
    params: Promise<{
        date: string;
    }>;
}

export async function generateStaticParams() {
    // Return empty array during build time as Cloudflare context is not available
    // This will be populated at runtime
    return [];
}

export async function generateMetadata({ params }: DatePageProps): Promise<Metadata> {
    const { date } = await params;
    const formattedDate = formatDisplayDate(date);
    
    return {
        title: `Drama Afera - ${formattedDate}`
    };
}

export default async function DateGamesPage({ params }: DatePageProps) {
    const { date } = await params;
    return <DateGamesContent date={date} seasonId={CURRENT_SEASON} />;
}
