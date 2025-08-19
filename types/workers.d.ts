// Type augmentation for Cloudflare Workers environment
// This file extends the auto-generated cloudflare-env.d.ts to include
// environment variables that are set as secrets in production

// Augment the CloudflareEnv interface
declare global {
  interface CloudflareEnv {
    API_USERNAME: string;
    API_PASSWORD: string;
  }
}

export {};