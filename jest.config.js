module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['./src/__mocks__/browserMocks.js'],
  transformIgnorePatterns: [
    '/node_modules(?!/@uidotdev/usehooks).+\\.js$',
  ],
};
