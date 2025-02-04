import {useContext} from "react";
import {RolesListContext} from "@/app/_components/RolesList/RolesList";

export const Search = () => {
    const {search} = useContext(RolesListContext);

    return (
        <input
            type="search"
            placeholder="Wyszukaj rolę..."
            className="w-full p-3 text-md bg-zinc-900/75 border-2 rounded-md border-search"
            onChange={(e) => search(e.target.value)}
        />
    );
}
