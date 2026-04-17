import { RolesList } from "@/app/_components";
import { MiraModifiers, MiraRoles } from "@/mira";

export const metadata = {
    title: "Mira",
    description: "Lista ról i modyfikatorów z Mira HQ.",
};

export default function MiraPage() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <RolesList roles={[...MiraRoles]} modifiers={[...MiraModifiers]} scaleRoleIcons={false} />
        </div>
    );
}