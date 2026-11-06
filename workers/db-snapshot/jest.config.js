// Własny przebieg Jest dla Workera. Jest roota łapie tylko src/, więc te testy tam nie biegną.
// Node ma fetch, Response, ReadableStream i TextDecoder, więc nie potrzeba runtime Workers.
// Logika leży w plikach bez importu `cloudflare:workers`, bo Node go nie zna.
/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['<rootDir>/test/**/*.test.ts'],
};
