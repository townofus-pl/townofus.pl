import type { Metadata } from "next";
import { CURRENT_SEASON } from "../../_constants/seasons";
import { RoleDetailContent } from "./RoleDetailContent";
import { normalizeRoleName, convertUrlSlugToRole } from "@/app/dramaafera/_utils/gameUtils";

// RoleDetailContent reads DramaAfera settings from D1 per request. Without
// `force-dynamic`, `generateStaticParams` below would snapshot settings at
// build time and host uploads would never reach already-built role pages.
export const dynamic = 'force-dynamic';

interface RolePageProps {
    params: Promise<{
        nazwa: string;
    }>;
}

export async function generateMetadata({ params }: RolePageProps): Promise<Metadata> {
    const { nazwa } = await params;
    const roleName = normalizeRoleName(convertUrlSlugToRole(nazwa, []), CURRENT_SEASON);

    return {
        title: `Drama Afera - ${roleName}`
    };
}

export async function generateStaticParams() {
    return [];
}

export default async function RoleStatsPage({ params }: RolePageProps) {
    const { nazwa } = await params;

    return <RoleDetailContent nazwa={nazwa} seasonId={CURRENT_SEASON} />;
}
