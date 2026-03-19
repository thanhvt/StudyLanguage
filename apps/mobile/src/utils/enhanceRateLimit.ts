import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Số lần tối đa user được enhance scenario mỗi ngày
 * Giới hạn này giúp kiểm soát chi phí API (GPT-4o-mini)
 */
const DAILY_LIMIT = 10;

/**
 * Tạo storage key cho ngày hiện tại
 *
 * Mục đích: Mỗi ngày có key riêng → tự reset khi sang ngày mới
 * Tham số đầu vào: không
 * Tham số đầu ra: string — key format "enhance_count_YYYY-MM-DD"
 * Khi nào sử dụng: Được gọi bởi canEnhanceToday / incrementEnhanceCount / getRemainingEnhances
 */
function getTodayKey(): string {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  return `enhance_count_${today}`;
}

/**
 * Kiểm tra user còn lượt enhance hôm nay không
 *
 * Mục đích: Rate limiting ở client-side, tránh gọi API không cần thiết
 * Tham số đầu vào: không
 * Tham số đầu ra: Promise<boolean> — true nếu còn lượt
 * Khi nào sử dụng: handleEnhanceScenario → check trước khi gọi API
 */
export async function canEnhanceToday(): Promise<boolean> {
  try {
    const count = await AsyncStorage.getItem(getTodayKey());
    const used = count ? parseInt(count, 10) : 0;
    return used < DAILY_LIMIT;
  } catch {
    console.error('❌ [RateLimit] Lỗi kiểm tra enhance limit');
    return true; // Fallback: cho phép nếu lỗi storage
  }
}

/**
 * Tăng bộ đếm enhance đã dùng hôm nay
 *
 * Mục đích: Ghi nhận 1 lượt enhance đã dùng
 * Tham số đầu vào: không
 * Tham số đầu ra: Promise<void>
 * Khi nào sử dụng: handleEnhanceScenario → sau khi API trả kết quả thành công
 */
export async function incrementEnhanceCount(): Promise<void> {
  try {
    const key = getTodayKey();
    const count = await AsyncStorage.getItem(key);
    const used = count ? parseInt(count, 10) : 0;
    await AsyncStorage.setItem(key, String(used + 1));
  } catch {
    console.error('❌ [RateLimit] Lỗi cập nhật enhance count');
  }
}

/**
 * Lấy số lượt enhance còn lại hôm nay
 *
 * Mục đích: Hiển thị cho user biết còn bao nhiêu lượt (nếu cần)
 * Tham số đầu vào: không
 * Tham số đầu ra: Promise<number> — số lượt còn lại (0 nếu hết)
 * Khi nào sử dụng: UI tooltip hoặc Alert thông báo
 */
export async function getRemainingEnhances(): Promise<number> {
  try {
    const count = await AsyncStorage.getItem(getTodayKey());
    const used = count ? parseInt(count, 10) : 0;
    return Math.max(0, DAILY_LIMIT - used);
  } catch {
    console.error('❌ [RateLimit] Lỗi lấy remaining enhances');
    return DAILY_LIMIT;
  }
}
