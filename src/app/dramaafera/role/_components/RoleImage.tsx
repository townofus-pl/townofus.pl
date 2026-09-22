"use client";

import Image from "next/image";
import { useState } from "react";
import { getRoleIconPath } from "@/app/dramaafera/_utils/gameUtils";

interface RoleImageProps {
    roleName: string;
    /** Selects the role registry, and with it the icon directory. See #308. */
    seasonId: number;
    width?: number;
    height?: number;
    className?: string;
}

export function RoleImage({ roleName, seasonId, width = 128, height = 128, className = "scale-[1.7]" }: RoleImageProps) {
    const [hasError, setHasError] = useState(false);
    
    return (
        <Image
            src={hasError ? "/images/roles/placeholder.png" : getRoleIconPath(roleName, seasonId)}
            alt={roleName}
            width={width}
            height={height}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
