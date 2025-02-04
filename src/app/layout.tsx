import type {Metadata} from "next";
import localFont from "next/font/local";
import {Barlow} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import "./globals.css";

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
    title: "townofus.pl - Among Us Town of Us Polska",
    description: "Serwis dla fanów gry Among Us z modyfikacją Town of Us",
};

export default function RootLayout({
   children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="text-sm md:text-base">
            <body className={`${brook.variable} ${barlow.variable} ${barlow.className} bg-cover`}>
                <div className="max-w-screen-xl m-auto">
                    {children}
                </div>
            </body>
            <GoogleAnalytics gaId="G-W12ZGZ57HF"/>
        </html>
    );
}
