import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    serverExternalPackages: ["@prisma/client", ".prisma/client"],
    // Worker nie ma bindingu IMAGES, więc /_next/image zwraca oryginał bajt w bajt, tylko pod
    // innym URL-em dla każdej szerokości i bez nagłówków cache. Efekt: ten sam obrazek pobierany
    // kilka razy. Bez optymalizacji każdy plik ma jeden adres i etag.
    // ponytail: gdyby kiedyś trzeba było zmniejszać awatary, dodać binding IMAGES i usunąć to.
    images: { unoptimized: true },
};

export default nextConfig;

initOpenNextCloudflareForDev();
