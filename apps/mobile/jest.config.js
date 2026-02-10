/** @type {import('jest').Config} */
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  // pnpm monorepo: cần transform mọi package liên quan đến RN ở mọi cấp độ
  transformIgnorePatterns: [
    'node_modules/(?!(.pnpm|@react-native|react-native|@react-navigation|@react-native-google-signin|react-native-track-player|react-native-config|react-native-mmkv|react-native-keychain|react-native-safe-area-context|react-native-screens|react-native-gesture-handler|react-native-reanimated|react-native-url-polyfill|react-native-svg|lucide-react-native|nativewind|zustand|@supabase|@tanstack|react-native-worklets)/)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFiles: ['<rootDir>/jest.setup.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
