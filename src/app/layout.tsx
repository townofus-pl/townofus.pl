import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const brook = localFont({
    src: '/_fonts/BrookPL.woff',
    display: 'swap',
    variable: '--font-brook',
});

const din = localFont({
    src: '/_fonts/DIN.woff',
    display: 'swap',
    variable: '--font-din',
});

export const metadata: Metadata = {
  title: "townofus.pl - Among Us Town of Us Polska",
  description: "Serwis dla fanó∑ gry Among Us z modyfikacją Town of Us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${brook.variable} ${din.variable}`}
      >
        <div className="max-w-screen-xl m-auto">
            {children}
        </div>
      </body>
    </html>
  );
}
