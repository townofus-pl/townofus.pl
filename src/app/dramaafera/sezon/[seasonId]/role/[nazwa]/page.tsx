import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getSeasonById } from '@/app/dramaafera/_constants/seasons';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';
import { Roles } from '@/roles';
import { convertUrlSlugToRole } from '@/app/dramaafera/_utils/gameUtils';
import { RoleDetailContent } from '@/app/dramaafera/role/[nazwa]/RoleDetailContent';

interface PageProps {
    params: Promise<{ seasonId: string; nazwa: string }>;
}

export function generateStaticParams() {
    return [];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { seasonId: seasonIdStr, nazwa } = await params;
    const seasonId = parseInt(seasonIdStr, 10);
    const allRoles = Roles.map(r => r.name);
    const roleName = convertUrlSlugToRole(nazwa, allRoles);
    return {
        title: `Drama Afera - ${roleName}`,
        alternates: {
            canonical: buildSeasonUrl(`/role/${nazwa}`, seasonId),
        },
    };
}

export default async function SeasonRolePage({ params }: PageProps) {
    const { seasonId: seasonIdStr, nazwa } = await params;
    const seasonId = parseInt(seasonIdStr, 10);

    if (!getSeasonById(seasonId)) {
        notFound();
    }

    return <RoleDetailContent nazwa={nazwa} seasonId={seasonId} />;
}
