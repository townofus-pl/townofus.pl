import {Teams} from "@/constants/teams";
import {RoleSubgroups} from "@/constants/roleSubgroups";
import {ModSource} from "@/constants/modSources";
import {RoleOrModifierTypes} from "@/constants/rolesAndModifiers";

export const Team = ({
    type,
    team,
    subgroup,
    source,
}: {
    type?: RoleOrModifierTypes,
    team: Teams,
    subgroup?: RoleSubgroups,
    source?: ModSource,
}) => {
    let teamClasses;

    switch (team) {
        case Teams.Crewmate:
            teamClasses = 'text-role-crewmate bg-role-crewmate/20';
            break;
        case Teams.Impostor:
            teamClasses = 'text-role-impostor bg-role-impostor/20';
            break;
        case Teams.Neutral:
        default:
            teamClasses = 'text-role-neutral bg-role-neutral/20';
            break;
    }

    const teamLabel = source === ModSource.Mira
        ? (type === RoleOrModifierTypes.Modifier && subgroup ? subgroup : `${team}${subgroup ? ` ${subgroup}` : ''}`)
        : `Team: ${team}`;

    return (
        <div className={`inline-block py-1 px-2.5 rounded text-2xl ${teamClasses}`}>
            {teamLabel}
        </div>
    );
}
