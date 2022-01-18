/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    'node_modules',
    'dist/tests',
    'src/tests/test-utils',
    'src/tests/test-data',
  ],
  collectCoverageFrom: [
    './src/**/*.ts',
    '!src/strategies/**/*.ts',
    '!src/bin/**/*.ts',
    '!src/backtest/controller.ts',
  ],
};
