import type { Metadata } from "next";
import { CURRENT_SEASON } from "@/app/dramaafera/_constants/seasons";
import { UserProfileContent } from "./UserProfileContent";

interface UserProfileProps {
    params: Promise<{ nick: string }>;
}

export async function generateStaticParams() {
    // Return empty array during build time as Cloudflare context is not available
    // This will be populated at runtime
    return [];
}

export async function generateMetadata({ params }: UserProfileProps): Promise<Metadata> {
    const { nick } = await params;
    const playerName = decodeURIComponent(nick.replace(/-/g, ' '));
    
    return {
        title: `Drama Afera - ${playerName}`,
        description: `Statystyki gracza ${playerName} w Among Us Drama Afera. Historia rankingu, zagranych gier i szczegółowe statystyki.`,
    };
}

export default async function UserProfilePage({ params }: UserProfileProps) {
    const { nick } = await params;
    return <UserProfileContent nick={nick} seasonId={CURRENT_SEASON} />;
}
