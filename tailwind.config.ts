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
