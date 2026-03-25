import type { Metadata } from "next";
import { getAllGamesData } from "../../_services";
import { Roles } from "@/roles";
import { CURRENT_SEASON } from "../../_constants/seasons";
import { RoleDetailContent } from "./RoleDetailContent";
import { convertRoleToUrlSlug, convertUrlSlugToRole } from "@/app/dramaafera/_utils/gameUtils";

interface RolePageProps {
    params: Promise<{
        nazwa: string;
    }>;
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
    const { nazwa } = await params;
    const allRoles = Roles.map(r => r.name);
    const roleName = convertUrlSlugToRole(nazwa, allRoles);

    return {
        title: `Drama Afera - ${roleName}`
    };
}

export async function generateStaticParams() {
    // No seasonId passed — getAllGamesData() defaults to CURRENT_SEASON via buildSeasonGameWhere().
    // This is intentional: static params only need roles from the current season.
    // Phase 8 season wrappers will handle cross-season role pages.
    const games = await getAllGamesData();
    const allRoles = new Set<string>();

    games.forEach(game => {
        game.detailedStats.playersData.forEach(player => {
            allRoles.add(player.role);

            if (player.roleHistory) {
                player.roleHistory.forEach(role => allRoles.add(role));
            }
        });
    });

    return Array.from(allRoles).map(role => ({
        nazwa: convertRoleToUrlSlug(role),
    }));
}

export default async function RoleStatsPage({ params }: RolePageProps) {
    const { nazwa } = await params;

    return <RoleDetailContent nazwa={nazwa} seasonId={CURRENT_SEASON} />;
}
