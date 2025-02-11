import {RolesList} from "./_components";
import {Roles} from "@/roles";
import {Modifiers} from "@/modifiers";

export default function Home() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <RolesList roles={Roles} modifiers={Modifiers}/>
        </div>
    );
}
