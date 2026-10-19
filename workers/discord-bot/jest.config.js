// The bot's own Jest run. The site's jest.config.js only matches src/, so these tests never run
// there. Node provides Request, Response and WebCrypto Ed25519, so no Workers runtime is needed.
/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.test.ts'],
};
