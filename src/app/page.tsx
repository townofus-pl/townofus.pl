import {RolesList} from "@/app/_components";
import {MiraModifiers, MiraRoles} from "@/mira";
import {Roles} from "@/roles";
import {Modifiers} from "@/modifiers";
import {ModSource} from "@/constants/modSources";
import type {Modifier, Role} from "@/constants/rolesAndModifiers";

const touRoles: Role[] = Roles.map((role) => ({
    ...role,
    source: role.source ?? ModSource.TownOfUs,
}));

const touModifiers: Modifier[] = Modifiers.map((modifier) => ({
    ...modifier,
    source: modifier.source ?? ModSource.TownOfUs,
}));

const miraRoles: Role[] = MiraRoles.map((role) => ({
    ...role,
    source: ModSource.Mira,
}));

const miraModifiers: Modifier[] = MiraModifiers.map((modifier) => ({
    ...modifier,
    source: ModSource.Mira,
}));

export default function Home() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <RolesList
                roles={[...miraRoles, ...touRoles]}
                modifiers={[...miraModifiers, ...touModifiers]}
                showModFilter={true}
                defaultModSource={ModSource.Mira}
                scaleRoleIcons={false}
            />
        </div>
    );
}
