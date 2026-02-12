const {getDefaultConfig, mergeConfig} = require("@react-native/metro-config");
const {withNativeWind} = require("nativewind/metro");
const path = require("path");

// Đường dẫn gốc của monorepo (thư mục cha 2 cấp so với apps/mobile)
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

/**
 * Cấu hình Metro cho pnpm monorepo
 * - watchFolders: Cho phép Metro theo dõi toàn bộ monorepo
 * - nodeModulesPaths: Cho phép Metro tìm packages ở cả local và root node_modules
 * - unstable_enableSymlinks: Bật hỗ trợ symlinks (pnpm dùng symlinks)
 *
 * QUAN TRỌNG: withNativeWind() PHẢI wrap cuối cùng để đảm bảo
 * custom transformer và CSS injection không bị override bởi mergeConfig
 *
 * @type {import("@react-native/metro-config").MetroConfig}
 */
const monorepoConfig = {
  watchFolders: [monorepoRoot],
  resolver: {
    // Bật hỗ trợ symlinks cho pnpm
    unstable_enableSymlinks: true,
    // Cho Metro biết tìm node_modules ở đâu
    nodeModulesPaths: [
      path.resolve(projectRoot, "node_modules"),
      path.resolve(monorepoRoot, "node_modules"),
    ],
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
};

// Bước 1: Merge cấu hình monorepo với default config
const baseConfig = mergeConfig(getDefaultConfig(__dirname), monorepoConfig);

// Bước 2: Wrap với NativeWind SAU CÙNG — đảm bảo transformerPath không bị override
// forceWriteFileSystem: true → bypass virtual modules (không tương thích Metro v0.82)
module.exports = withNativeWind(baseConfig, {
  input: "./src/config/global.css",
  forceWriteFileSystem: true,
});

