import type {FC, ReactNode} from "react";

type NavigationItemProps = {
    label: string,
    image: ReactNode,
    selected?: boolean,
};

export const NavigationLabel: FC<NavigationItemProps> = ({label, image, selected}) => (
    <>
        {image && <span className="block w-5 h-5">{image}</span>}
        <span className={selected ? "underline underline-offset-4" : undefined}>{label}</span>
    </>
);
