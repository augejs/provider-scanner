module.exports = {
  rootDir: ".",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.ts'],
  coverageDirectory: "./coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/main.ts",
    "!src/**/*index.ts",
    "!src/**/*d.ts"
  ],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  testRegex: ".test.ts$",
  moduleFileExtensions: [
    "ts",
    "js"
  ],
};
