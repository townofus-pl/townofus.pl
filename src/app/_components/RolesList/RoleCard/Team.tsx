import {Teams} from "@/constants/teams";

export const Team = ({team}: { team: Teams }) => {
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

    return (
        <div className={`inline-block py-1 px-2.5 rounded text-2xl ${teamClasses}`}>
           Team: {team}
        </div>
    );
}
