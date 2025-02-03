import {Header, RoleCard, Search} from "./_components";
import {Roles} from "@/roles";

export default function Home() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <Header/>
            <Search/>
            <main>
                <div className="grid grid-cols-1 gap-y-5">
                    {Roles.map(role => (
                        <RoleCard key={role.name} role={role}/>
                    ))}
                </div>
            </main>
        </div>
    );
}
