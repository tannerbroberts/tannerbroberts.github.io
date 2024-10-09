module.exports = {
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  setupFilesAfterEnv: ['./src/__mocks__/browserMocks.js'],
  transformIgnorePatterns: [
    '/node_modules(?!/@uidotdev/usehooks).+\\.js$',
  ],
};
