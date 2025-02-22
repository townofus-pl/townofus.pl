export default function Lobby15Plus() {
  return (
    <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl mb-5">
    <div className="relative w-full rounded-xl">

      <div className="inset-0 z-10 flex items-center justify-center rounded-xl mt-5 mb-5">
        <div className="text-white px-4 rounded-xl">
          <br/>
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
            <p className="text-red-500 text-8xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] text-center">AleLuduMod</p>
            <p className="text-2xl text-gray-100 mt-2 mb-8 text-center">Mod umożliwiający grę na więcej niż 15 graczy.</p>
            <p className="text-xl text-gray-100 mt-15 mb-2">Mod zawiera:</p>
            <ul className="text-left text-lg text-gray-100 mb-6 space-y-2">
              <li>- poprawiony widok podczas głosowania,</li>
              <li>- opcję tworzenia lobby do 35 graczy.</li>
            </ul>
            <p className="text-xl text-gray-100 mt-15 mb-2">Jak wgrać moda?</p>
            <ul className="text-left text-lg text-gray-100 mb-6 space-y-2">
              <li>1. Pobierz plik z poniższego linku</li>
              <li>2. Wrzuć plik <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">AleLuduMod.dll</code> do folderu <br/> <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">&lt;Among Us - Town of Us&gt;\BepInEx\plugins\</code></li>
              <li>3. Uruchom grę</li>
            </ul>
            <div className="grid grid-cols-2 gap-4 mt-10 md:flex md:justify-center md:space-x-4">
              <a
                href="https://github.com/townofus-pl/AleLuduMod/releases/download/v1.0.2/AleLuduMod.dll"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-[rgba(0,167,0)] hover:bg-[rgba(0, 167, 0, 0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center"
              >
                <img src="/images/download-button.svg" width="16" height="16"/> 
                &nbsp; Download
              </a>
              <a
                href="https://github.com/townofus-pl/AleLuduMod/"
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-3 bg-[rgba(63,63,63)] hover:bg-[rgba(63,63,63,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center"
              >
                <img src="/images/github-logo.svg" width="16" height="16"/> 
                &nbsp; GitHub
              </a>
              <a
                href="https://discord.townofus.pl/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-[rgba(86,98,246)] hover:bg-[rgba(86,98,246,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center col-span-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612" />
                </svg> 
                &nbsp; Feedback
              </a>
            </div>
          <p className="text-lg text-gray-100 mt-5 mb-2 text-center">Mod działa lokalnie, więc nie wszyscy gracze muszą go mieć zainstalowanego, aby móc grać.</p>
            </div>
            <div className="md:w-1/2 flex flex-col items-center">
            <img className="mx-auto mr-4 mt-4" src="/images/aleludumodtownofus.png" width="500"/>
            <img className="mx-auto mr-4 mt-4 mb-4" src="/images/aleludumodmenu.png" width="500"/>
            </div>
          </div>

          <br />
        </div>
      </div>
    </div>
  </div>
  );
}
