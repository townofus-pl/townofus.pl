export default function Lobby15Plus() {
  return (
    <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl mb-5 p-4">
      <div className="relative w-full rounded-xl">
        <div className="inset-0 z-10 flex items-center justify-center rounded-xl my-5">
          <div className="text-white w-full max-w-7xl px-4 rounded-xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/2 space-y-6">
                <div>
                  <p className="text-red-500 text-8xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.7)] text-center">AleLuduMod</p>
                  <p className="text-xl sm:text-2xl text-gray-100 mt-4 text-center">Mod umożliwiający grę na więcej niż 15 graczy.</p>
                </div>

                <div className="space-y-4">
                  <p className="text-xl text-gray-100">Mod zawiera:</p>
                  <ul className="text-left text-lg text-gray-100 space-y-2 list-disc pl-6">
                    <li>poprawiony widok podczas głosowania oraz na vitalsach,</li>
                    <li>opcję tworzenia lobby do 35 graczy.</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <p className="text-xl text-gray-100">Jak wgrać moda?</p>
                  <ul className="text-left text-lg text-gray-100 space-y-2 list-decimal pl-6">
                    <li>Pobierz plik z poniższego linku</li>
                    <li>Wrzuć plik <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">AleLuduMod.dll</code> do folderu <br/> <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">&lt;Among Us - Town of Us&gt;\BepInEx\plugins\</code></li>
                    <li>Uruchom grę</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://github.com/townofus-pl/AleLuduMod/releases/download/v1.0.4/AleLuduMod.dll"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(0,167,0)] hover:bg-[rgba(0,167,0,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <img src="/images/download-button.svg" width="16" height="16" alt="download"/> 
                    <span className="ml-2">Download v1.0.4</span>
                  </a>
                  <a
                    href="https://github.com/townofus-pl/AleLuduMod/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(63,63,63)] hover:bg-[rgba(63,63,63,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <img src="/images/github-logo.svg" width="16" height="16" alt="github"/> 
                    <span className="ml-2">GitHub</span>
                  </a>
                  <a
                    href="https://discord.townofus.pl/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(86,98,246)] hover:bg-[rgba(86,98,246,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <img src="/images/discord-logo.svg" width="16" height="16" alt="discord"/>
                    <span className="ml-2">Feedback</span>
                  </a>
                </div>

                <p className="text-lg text-gray-100 text-center">Mod działa lokalnie, więc nie wszyscy gracze muszą go mieć zainstalowanego, aby móc grać.</p>
              </div>

              <div className="md:w-1/2 flex flex-col items-center justify-center gap-4">
                <img 
                  className="w-full max-w-xl rounded-lg" 
                  src="/images/aleludumodtownofus.png" 
                  alt="AleLuduMod Town of Us"
                />
                <img 
                  className="w-full max-w-xl rounded-lg" 
                  src="/images/aleludumodmenu.png" 
                  alt="AleLuduMod Menu"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}