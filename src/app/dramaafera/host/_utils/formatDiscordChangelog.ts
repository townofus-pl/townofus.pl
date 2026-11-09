import { Teams } from '@/constants/teams';
import { CURRENT_SEASON } from '../../_constants/seasons';
import { convertRoleNameForDisplay, determineTeam } from '../../_utils/gameUtils';
import type { ReviewCategory } from '../../changelog/_categories';

const TEAM_ORDER = [Teams.Crewmate, Teams.Neutral, Teams.Impostor, Teams.Assailant, Teams.All];
const warsawDate = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
});
const announcementDate = new Intl.DateTimeFormat('pl-PL', {
    timeZone: 'UTC', day: '2-digit', month: '2-digit',
});

function nextWednesday(now: Date): string {
    const parts = warsawDate.formatToParts(now);
    const value = (type: 'year' | 'month' | 'day') => Number(parts.find(part => part.type === type)?.value);
    const date = new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
    const daysUntilWednesday = (3 - date.getUTCDay() + 7) % 7 || 7;
    date.setUTCDate(date.getUTCDate() + daysUntilWednesday);
    return announcementDate.format(date);
}

export function formatDiscordChangelog(changes: readonly { roleName: string; category: ReviewCategory }[], now: Date): string {
    function roleList(category: ReviewCategory): string {
        const names = [...new Set(changes.filter(change => change.category === category)
            .map(change => convertRoleNameForDisplay(change.roleName)))].sort((a, b) => a.localeCompare(b, 'en'));
        const bullet = (name: string) => '- ' + name.toUpperCase();
        const teams = new Map<string, string[]>();
        for (const name of names) {
            const team = determineTeam(name, CURRENT_SEASON);
            const lines = teams.get(team) ?? [];
            lines.push(bullet(name));
            teams.set(team, lines);
        }
        return TEAM_ORDER.flatMap(team => teams.get(team)?.join('\n') ?? []).join('\n\n');
    }

    const section = (heading: string, category: ReviewCategory) => {
        const roles = roleList(category);
        return roles ? heading + '\n' + roles : '';
    };
    const emperorRoles = roleList('emperor_decree');

    return [
        '<@&1331029494408155146>\n**AMONG US DRAMA AFERA ' + nextWednesday(now) + ' CHANGELOG**',
        section('**BUFFS:**', 'buff'),
        section('**NERFS:**', 'nerf'),
        section('**ADJUSTMENTS:**', 'adjustment'),
        emperorRoles ? '===\n📜 **ZMIANY WPROWADZONE PRZEZ EMPERORA - `Tu oznacz emperora`:**\n\n' + emperorRoles : '',
        'https://townofus.pl/dramaafera/changelog',
        '<:bloodtrail:774382109565386786>',
    ].filter(Boolean).join('\n\n');
}
