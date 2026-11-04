'use client';

import { useEffect, useRef, useState } from 'react';

/** Measure the actual font and available space, including after the web font loads. */
export function useFittedControlText<T extends HTMLElement>(text: string) {
    const ref = useRef<T>(null);
    const [fontSize, setFontSize] = useState<number>();

    useEffect(() => {
        const container = ref.current;
        const element = container?.querySelector('input, select') ?? container;
        if (!element) return;
        const context = document.createElement('canvas').getContext('2d');
        if (!context) return;
        let active = true;
        const fit = () => {
            if (!active || !element.clientWidth) return;
            const style = getComputedStyle(element);
            const maximum = parseFloat(getComputedStyle(document.documentElement).fontSize) * 1.5;
            const available = element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - 4;
            context.font = `${style.fontStyle} ${style.fontWeight} ${maximum}px ${style.fontFamily}`;
            const width = context.measureText(text).width;
            const size = width > available ? Math.max(1, Math.floor(maximum * available / width)) : maximum;
            setFontSize(size);
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(element);
        void document.fonts.ready.then(fit);
        document.fonts.addEventListener('loadingdone', fit);
        return () => {
            active = false;
            observer.disconnect();
            document.fonts.removeEventListener('loadingdone', fit);
        };
    }, [text]);

    return { ref, fontSize };
}
