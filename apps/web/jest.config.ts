import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Đường dẫn tới Next.js app để load next.config.js và .env files
  dir: './',
});

// Cấu hình Jest tùy chỉnh
const customJestConfig: Config = {
  // Thêm setup file
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // Môi trường test DOM
  testEnvironment: 'jsdom',

  // Module name mapper cho path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Thư mục chứa test files
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)',
  ],

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};

// createJestConfig được export như thế này để đảm bảo next/jest
// có thể load config Next.js đúng cách (async)
export default createJestConfig(customJestConfig);
