/**
 * .pnpmfile.cjs
 * Mục đích: Giải quyết vấn đề duplicate packages trong pnpm monorepo
 * 
 * Khi nào được sử dụng:
 * - pnpm đọc file này trong quá trình install dependencies
 * - Hook readPackage được gọi cho mỗi package trong node_modules
 * 
 * Vấn đề giải quyết:
 * - pnpm tạo nhiều bản sao của @nestjs/common với các peer dependencies khác nhau
 * - Điều này gây ra lỗi TypeScript incompatible types
 */

function readPackage(pkg, context) {
  // Buộc @nestjs/swagger sử dụng cùng peer dependencies như các package khác
  if (pkg.name === '@nestjs/swagger') {
    // Đảm bảo sử dụng class-transformer và class-validator đã cài đặt
    pkg.peerDependencies = {
      ...pkg.peerDependencies,
      'class-transformer': '*',
      'class-validator': '*',
    };
    context.log('@nestjs/swagger: Hoisting class-transformer & class-validator');
  }

  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
