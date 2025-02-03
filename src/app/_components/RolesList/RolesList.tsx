'use client';

import debounce from "lodash.debounce";
import {createContext, useMemo, useState, ChangeEvent} from "react";
import {Roles} from "@/roles";
import {Modifiers} from "@/modifiers";
import {Search} from "@/app/_components";
import {RoleCard} from "./RoleCard/RoleCard";

const RolesAndModifiers = [...Roles, ...Modifiers];

type RolesListContextType = {
    searchValue: string;
    search: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const RolesListContext = createContext<RolesListContextType>({
    searchValue: '',
    search: () => {}
});

export const RolesList = () => {
    const [searchValue, setSearchValue] = useState<string>('');

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const search = useMemo(() => debounce(handleChange, 300), []);

    const results = useMemo(
        () => RolesAndModifiers.filter(({ name }) => name.toLowerCase().startsWith(searchValue.toLowerCase())),
        [searchValue]
    );

    return (
        <RolesListContext.Provider value={{ searchValue, search }}>
            <Search />
            <main>
                <div className="grid grid-cols-1 gap-y-5">
                    {results.map(role => (
                        <RoleCard key={role.name} role={role}/>
                    ))}
                </div>
            </main>
        </RolesListContext.Provider>
    );
}
