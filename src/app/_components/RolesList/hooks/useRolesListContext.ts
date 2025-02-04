import {createContext, useContext} from "react";
import {RoleFilters, TeamFilters} from "./useFilters";


type RolesListContextType = {
    searchValue: string;
    search: (x: string) => void;
    filter: (x: RoleFilters|TeamFilters) => void;
};

export const RolesListContext = createContext<RolesListContextType>({
    searchValue: '',
    search: () => {
    },
    filter: () => {
    },
});

export const useRolesListContext = () => useContext(RolesListContext);
