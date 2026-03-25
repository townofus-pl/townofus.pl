import type { Metadata } from "next";
import { getAllGamesData } from "../../_services";
import { Roles } from "@/roles";
import { CURRENT_SEASON } from "../../_constants/seasons";
import { RoleDetailContent } from "./RoleDetailContent";

// Funkcja pomocnicza do normalizacji nazw ról z bazy danych
function normalizeRoleName(role: string): string {
    const roleNameMapping: Record<string, string> = {
        'SoulCollector': 'Soul Collector',
        'GuardianAngel': 'Guardian Angel',
    };
    return roleNameMapping[role] || role;
}

// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
    return role.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
}

// Funkcja pomocnicza do konwersji URL slug z powrotem na nazwę roli
function convertUrlSlugToRole(slug: string, allRoles: string[]): string {
    const slugLower = slug.toLowerCase();

    for (const role of allRoles) {
        const normalizedRole = normalizeRoleName(role);
        if (convertRoleToUrlSlug(normalizedRole) === slugLower) {
            return normalizedRole;
        }
    }

    // Fallback - konwertuj myślniki na spacje i kapitalizuj pierwsze litery słów
    const words = decodeURIComponent(slug.replace(/-/g, ' ')).split(' ');
    return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

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
