import type {FC, ReactNode} from "react";

export const NavigationLabel: FC<{ label: string, image: ReactNode, selected?: boolean }> = ({
                                                                                                 label,
                                                                                                 image,
                                                                                                 selected
                                                                                             }) => (
    <>
        {image && (
            <span className="block w-5 h-5">
                    {image}
                </span>
        )}
        <span className={selected ? "underline underline-offset-4" : undefined}>{label}</span>
    </>
);
