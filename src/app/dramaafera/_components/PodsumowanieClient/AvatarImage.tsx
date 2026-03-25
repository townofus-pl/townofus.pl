'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CSSProperties } from 'react';

interface AvatarImageFillProps {
    nickname: string;
    className?: string;
    style?: CSSProperties;
}

/**
 * Avatar image that fills its container (use inside a relative-positioned wrapper).
 * Falls back to placeholder on error using state, avoiding the next/image DOM mutation anti-pattern.
 */
export function AvatarImageFill({ nickname, className = 'object-cover', style }: AvatarImageFillProps) {
    const [hasError, setHasError] = useState(false);
    return (
        <Image
            src={hasError ? '/images/avatars/placeholder.png' : `/images/avatars/${nickname}.png`}
            alt={nickname}
            fill
            className={className}
            style={style}
            onError={() => setHasError(true)}
        />
    );
}

interface AvatarImageSizedProps {
    nickname: string;
    size: number;
    className?: string;
    priority?: boolean;
    style?: CSSProperties;
}

/**
 * Avatar image with explicit width/height.
 * Falls back to placeholder on error using state, avoiding the next/image DOM mutation anti-pattern.
 */
export function AvatarImageSized({ nickname, size, className, priority, style }: AvatarImageSizedProps) {
    const [hasError, setHasError] = useState(false);
    return (
        <Image
            src={hasError ? '/images/avatars/placeholder.png' : `/images/avatars/${nickname}.png`}
            alt={nickname}
            width={size}
            height={size}
            className={className}
            priority={priority}
            style={style}
            onError={() => setHasError(true)}
        />
    );
}
