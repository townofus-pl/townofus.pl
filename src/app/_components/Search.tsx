import {useContext} from "react";
import {RolesListContext} from "@/app/_components/RolesList/RolesList";

export const Search = () => {
    const {search} = useContext(RolesListContext);

    return (
        <div className="col-span-2 md:col-span-3 lg:col-span-6 text-lg">
            <label htmlFor="Search">Wyszukaj:</label>
            <input
                name="search"
                type="search"
                placeholder="Engineer, Bomber, Lovers..."
                className="w-full p-2.5 bg-zinc-900/75 border-2 rounded-md border-search"
                onChange={(e) => search(e.target.value)}
            />
        </div>
    );
}
