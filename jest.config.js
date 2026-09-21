// ts-jest was already a dependency with no config, so `npm test` found nothing and passed. CI
// runs it (check.yml), so a test written here actually gates a merge.
/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // Tests live next to what they test. src/generated/ is excluded from type-checking and has
    // none.
    testMatch: ['<rootDir>/src/**/*.test.ts'],
    moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
    // Build output and agent worktrees each contain a package.json named townofus.pl, which
    // jest-haste-map reports as a naming collision on every run.
    modulePathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/.claude/worktrees/', '<rootDir>/.open-next/'],
};
