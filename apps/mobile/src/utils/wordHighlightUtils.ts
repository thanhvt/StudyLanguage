/**
 * Word Highlight Utilities — Binary search và helpers cho word-level karaoke
 *
 * Mục đích: Cung cấp hàm tìm kiếm từ đang nói dựa trên audio position
 * Khi nào sử dụng: Được import bởi useWordHighlight hook
 */

/**
 * Timestamp cho từng từ trong audio — trả về từ Azure TTS
 */
export interface WordTimestamp {
  /** Từ được đọc */
  word: string;
  /** Thời điểm bắt đầu (giây) */
  startTime: number;
  /** Thời điểm kết thúc (giây) */
  endTime: number;
}

/**
 * Mục đích: Tìm index của từ đang được nói tại thời điểm `position`
 * Tham số đầu vào:
 *   - timestamps: mảng WordTimestamp đã sắp xếp theo startTime
 *   - position: vị trí audio hiện tại (giây)
 * Tham số đầu ra: index (number), -1 nếu không tìm thấy
 * Khi nào sử dụng: Được gọi mỗi 80ms bởi useWordHighlight hook
 *   Flow: setInterval → TrackPlayer.getProgress → findCurrentWordIndex
 */
export function findCurrentWordIndex(
  timestamps: WordTimestamp[],
  position: number,
): number {
  if (!timestamps.length) return -1;

  let lo = 0;
  let hi = timestamps.length - 1;

  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const ts = timestamps[mid];

    if (position < ts.startTime) {
      hi = mid - 1;
    } else if (position > ts.endTime) {
      lo = mid + 1;
    } else {
      // position >= startTime && position <= endTime
      return mid;
    }
  }

  return -1; // Đang ở khoảng lặng giữa 2 từ
}

/**
 * Mục đích: Tìm từ đang nói, nếu ở khoảng lặng thì giữ từ trước đó
 * Tham số đầu vào:
 *   - timestamps: mảng WordTimestamp
 *   - position: vị trí audio hiện tại (giây)
 *   - lastIndex: index từ trước đó (để giữ highlight khi ở gap)
 * Tham số đầu ra: index (number)
 * Khi nào sử dụng: Wrapper trên findCurrentWordIndex, xử lý gap case
 *   Flow: useWordHighlight → findCurrentWordIndexWithFallback → UI render
 */
export function findCurrentWordIndexWithFallback(
  timestamps: WordTimestamp[],
  position: number,
  lastIndex: number,
): number {
  const exactIndex = findCurrentWordIndex(timestamps, position);

  // Nếu tìm thấy chính xác → trả về
  if (exactIndex !== -1) return exactIndex;

  // Nếu ở khoảng lặng → giữ từ trước đó (nếu hợp lệ)
  if (lastIndex >= 0 && lastIndex < timestamps.length) {
    // Chỉ giữ nếu position chưa vượt quá từ tiếp theo
    const nextIndex = lastIndex + 1;
    if (nextIndex < timestamps.length && position < timestamps[nextIndex].startTime) {
      return lastIndex;
    }
  }

  return -1;
}
