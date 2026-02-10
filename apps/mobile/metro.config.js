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
 * @type {import("@react-native/metro-config").MetroConfig}
 */
const config = {
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

module.exports = mergeConfig(
  withNativeWind(getDefaultConfig(__dirname), {
    input: "./src/config/global.css",
  }),
  config,
);
