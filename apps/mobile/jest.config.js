const path = require('path');

module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: false,
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript',
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(zustand)/)',
  ],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/*.test.[jt]s?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^react-native/(.*)$': '<rootDir>/__mocks__/react-native.js',
    '^@expo/vector-icons$': '<rootDir>/__mocks__/expo-vector-icons.js',
    '^expo-secure-store$': '<rootDir>/__mocks__/expo-secure-store.js',
    '^expo-router$': '<rootDir>/__mocks__/expo-router.js',
    '^expo-constants$': '<rootDir>/__mocks__/expo-constants.js',
    '^react-test-renderer$': '<rootDir>/__mocks__/test-renderer.js',
    '^test-renderer$': '<rootDir>/__mocks__/test-renderer.js',
  },
  collectCoverageFrom: [
    'hooks/**/*.ts',
    'store/**/*.ts',
    'lib/**/*.ts',
    'components/**/*.tsx',
    '!**/__tests__/**',
    '!**/index.ts',
  ],
};
