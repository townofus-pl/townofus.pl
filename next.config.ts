import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
    poweredByHeader: false,
    serverExternalPackages: ["@prisma/client", ".prisma/client"],
};

export default nextConfig;

initOpenNextCloudflareForDev();
