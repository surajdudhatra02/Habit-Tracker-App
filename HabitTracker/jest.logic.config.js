// Isolate business logic from native modules and the app's existing smoke test.
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/logic/**/*.test.ts',
    '**/__tests__/logic/**/*.test.tsx',
  ],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: ['module:@react-native/babel-preset'],
      },
    ],
  },
};
