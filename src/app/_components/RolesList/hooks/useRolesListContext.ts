import {createContext, useContext} from "react";
import type {AvailableFilters, TeamFilters, TypeFilters} from "./useFilters";
import type {ModSource} from "@/constants/modSources";


type RolesListContextType = {
    searchValue: string;
    search: (value: string) => void;
    filter: (type: AvailableFilters, value: TypeFilters | TeamFilters | ModSource) => void;
    showModFilter: boolean;
};

export const RolesListContext = createContext<RolesListContextType>({
    searchValue: '',
    search: () => {
    },
    filter: () => {
    },
    showModFilter: false,
});

export const useRolesListContext = () => useContext(RolesListContext);
