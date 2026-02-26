/**
 * Mục đích: Format số giây thành dạng m:ss — dùng chung cho player/compact player
 * Tham số đầu vào: seconds (number) — số giây cần format
 * Tham số đầu ra: string — dạng "m:ss" (vd: "2:05")
 * Khi nào sử dụng:
 *   - PlayerScreen → hiển thị current/total time
 *   - CompactPlayer → hiển thị thời gian mini
 *   - BUG-05 fix: Thống nhất logic, tránh duplicate
 */
export function formatTime(seconds: number): string {
  // EC-M05/EC-m11 fix: Xử lý NaN, Infinity, undefined, null, và số âm
  if (!seconds || isNaN(seconds) || !isFinite(seconds) || seconds < 0) {
    return '0:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
