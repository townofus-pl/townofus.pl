import Image from "next/image";
export default function DiscordInvite() {
  return (
    <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl mb-5">
      <div className="relative w-full rounded-xl">

        <div className="inset-0 z-10 flex items-center justify-center rounded-xl mt-5 mb-5">
          <div className="text-white text-center px-4 rounded-xl">
            <div className="relative text-center text-white">
            
              <p className="text-red-500 text-8xl mb-6 font-brook font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">Ultimate Among Us Phase</p>
            </div>
            <p className="text-2xl">
              <span> to serwer Discord gdzie:</span>
            </p>
            <br />
            <ul className="text-left text-lg text-gray-100 mb-6 space-y-2 text-center">
              <li>- zagracie w Among Us na modach lub bez,</li>
              <li>- zmieścicie na lobby więcej niż 15 osób,</li>
              <li>- znajdziecie znajomych do gry na Waszym serwerze,</li>
              <li>- nie tolerujemy toksyczności, dyskryminacji, rasizmu, homofobii, etc.</li>
              <li>- tylko gracze 18+.</li>
            </ul>
            <div className="flex justify-center">
              <a
                href="https://discord.townofus.pl/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-[rgba(86,98,246)] hover:bg-[rgba(86,98,246,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex place-items-center"
              >
                <Image src="/images/discord-logo.svg" width={16} height={16} alt="discord" />  &nbsp; Dołącz do Discorda
              </a>
            </div>
            <br />
            <p className="text-lg italic mb-6 text-gray-400">
                Jeden by z wszystkimi zagrać, Jeden by wszystkie odnaleźć, Jeden by wszystkie zgromadzić i w zabawie zjednać.
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
