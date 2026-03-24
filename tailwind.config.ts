import type {Config} from "tailwindcss";
import {TeamColors} from "./src/constants/teams";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                'role-crewmate': TeamColors.Crewmate,
                'role-impostor': TeamColors.Impostor,
                'role-neutral': TeamColors.Neutral,
            },
            backgroundColor: {
                'discord-blurple': '#5865F2',
            },
            borderColor: {
                search: "rgb(51 51 51)",
            },
            fontFamily: {
                brook: "var(--font-brook)",
                barlow: "var(--font-barlow)",
            },
            gridTemplateColumns: {
                '2/1': '2fr 1fr',
            },
            backgroundImage: {
                'chevron-gray': `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%239ca3af'%3E%3Cpath fill-rule='evenodd' d='M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06z' clip-rule='evenodd'/%3E%3C/svg%3E")`,
            },
            borderWidth: {
                5: '5px',
            }
        },
    },
    safelist: [
        'list-disc',
        'list-inside',
    ],
    plugins: [],
} satisfies Config;
