import Link from "next/link";
import Image from "next/image";

export const DiscordLink = () => (
    <div
        className="fixed top-4 right-4 z-10 w-14 h-14 px-2 py-3 bg-discord-blurple text-white text-center rounded-lg drop-shadow-md hover:scale-110 hover:drop-shadow-lg transition-transform duration-300">
        <Link href="https://discord.townofus.pl" target="_blank" rel="noreferrer" title="Dołącz do naszego Discorda!">
            <Image src="/images/discord-logo.svg" alt="Discord" width={127} height={96}/>
        </Link>
    </div>
);
