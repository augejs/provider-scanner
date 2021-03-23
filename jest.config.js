module.exports = {
  rootDir: ".",
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./jest.setup.ts'],
  coverageDirectory: "../coverage",
  collectCoverageFrom: [
    "**/*.(t|j)s"
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
