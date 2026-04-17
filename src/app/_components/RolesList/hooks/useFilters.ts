import {useCallback, useState} from "react";
import {sendGAEvent} from "@next/third-parties/google";
import {ModSource} from "@/constants/modSources";

export enum AvailableFilters {
    Type = 'type',
    Team = 'team',
    Mod = 'mod',
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

type UseFiltersOptions = {
    defaultModSource?: ModSource;
};

export const useFilters = ({defaultModSource}: UseFiltersOptions = {}) => {
    const [typeFilterValue, setTypeFilterValue] = useState<TypeFilters>();
    const [teamFilterValue, setTeamFilterValue] = useState<TeamFilters>();
    const [modFilterValue, setModFilterValue] = useState<ModSource | undefined>(defaultModSource);

    const filter = useCallback((type: AvailableFilters, value: TypeFilters | TeamFilters | ModSource) => {
        switch (type) {
            case AvailableFilters.Type:
                setTypeFilterValue(value as TypeFilters);
                break;
            case AvailableFilters.Team:
                setTeamFilterValue(value as TeamFilters);
                break;
            case AvailableFilters.Mod:
                setModFilterValue(value as ModSource);
                break;
            default:
                throw new Error(`Unknown filter type: ${type}`);
        }

        sendGAEvent('event', 'filter', {type, value});
    }, []);

    return {
        typeFilterValue,
        teamFilterValue,
        modFilterValue,
        filter,
    };
}
