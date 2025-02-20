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
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                </svg> &nbsp; Dołącz do Discorda
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
