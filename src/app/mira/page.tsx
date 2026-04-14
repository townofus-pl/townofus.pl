import {RolesList} from "@/app/_components";
import {MiraModifiers, MiraRoles} from "@/mira";

export default function MiraPage() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <RolesList roles={[...MiraRoles]} modifiers={[...MiraModifiers]} scaleRoleIcons={false}/>
        </div>
    );
}
