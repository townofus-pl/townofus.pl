import type {Metadata} from "next";
import localFont from "next/font/local";
import {Barlow} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import {Header} from "./_components/Header/Header";


const brook = localFont({
    src: '/_fonts/BrookPL.woff',
    display: 'swap',
    variable: '--font-brook',
});

const barlow = Barlow({
    subsets: ["latin-ext"],
    weight: ["400", "700"],
    variable: '--font-barlow',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Among Us Drama Afera XD",
    description: "Boxdel na KoGmawie. Hexakill na FameMMA 18. UWAGA: Martwy Wojciech Gola",
};

export default function RootLayout({
   children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="text-sm md:text-base">
            <body className={`${brook.variable} ${barlow.variable} ${barlow.className}`}>
                <div className="max-w-screen-xl m-auto">
                    <Header />
                    {children}
                </div>
                <GoogleAnalytics gaId="G-W12ZGZ57HF"/>
            </body>
        </html>
    );
}
