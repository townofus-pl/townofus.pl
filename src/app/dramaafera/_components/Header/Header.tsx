import Link from "next/link";
import {Navigation} from "./Navigation/Navigation";
import {SeasonSwitcher} from "./SeasonSwitcher";

export const Header = () => (
    <header className="grid grid-cols-1 lg:grid-cols-[1fr_auto] lg:grid-rows-[auto_auto_auto] gap-x-6 gap-y-6 bg-zinc-900/50 px-5 py-5 rounded-xl mb-5">
        <h1 className="text-7xl font-bold font-brook lg:col-start-1 lg:row-start-1">
            <Link href="/dramaafera">AMONG US - DRAMA AFERA</Link>
        </h1>
        <h2 className="text-3xl font-brook hidden sm:block lg:col-span-2 lg:row-start-2">
            Co środę między 18:00 a 22:00
        </h2>
        <div className="lg:col-start-1 lg:row-start-3">
            <Navigation/>
        </div>
        <SeasonSwitcher className="lg:col-start-2 lg:row-start-3 lg:self-end lg:justify-self-end"/>
        <p className="font-barlow text-base text-gray-500 lg:col-start-2 lg:row-start-1 lg:justify-self-end lg:self-start">
            Created by Malkiz, Quarties &amp; OrzechMC
        </p>
    </header>
);
