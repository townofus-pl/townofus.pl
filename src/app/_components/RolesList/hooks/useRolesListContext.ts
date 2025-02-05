import {createContext, useContext} from "react";
import type {AvailableFilters, TeamFilters, TypeFilters} from "./useFilters";


type RolesListContextType = {
    searchValue: string;
    search: (value: string) => void;
    filter: (type: AvailableFilters, value: TypeFilters | TeamFilters) => void;
};

export const RolesListContext = createContext<RolesListContextType>({
    searchValue: '',
    search: () => {
    },
    filter: () => {
    },
});

export const useRolesListContext = () => useContext(RolesListContext);
