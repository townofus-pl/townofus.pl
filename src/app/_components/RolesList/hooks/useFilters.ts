import {useCallback, useState} from "react";
import {sendGAEvent} from "@next/third-parties/google";

export enum AvailableFilters {
    Type = 'type',
    Team = 'team',
}

export enum TypeFilters {
    Role = 'Role',
    Modifier = 'Modifier',
}

export enum TeamFilters {
    Crewmate = 'Crewmate',
    Neutral = 'Neutral',
    Impostor = 'Impostor',
}

export const useFilters = () => {
    const [typeFilterValue, setTypeFilterValue] = useState<TypeFilters>();
    const [teamFilterValue, setTeamFilterValue] = useState<TeamFilters>();

    const filter = useCallback((type: AvailableFilters, value: TypeFilters | TeamFilters) => {
        switch (type) {
            case AvailableFilters.Type:
                setTypeFilterValue(value as TypeFilters);
                break;
            case AvailableFilters.Team:
                setTeamFilterValue(value as TeamFilters);
                break;
            default:
                throw new Error(`Unknown filter type: ${type}`);
        }

        sendGAEvent('event', 'filter', {type, value});
    }, []);

    return {
        typeFilterValue,
        teamFilterValue,
        filter,
    };
}
