import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import Animated, {FadeInDown} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import {useNavigation} from '@react-navigation/native';
import {useColors} from '@/hooks/useColors';

// Mock data — sẽ thay bằng API GET /api/user/last-session sau
const MOCK_LAST_SESSION: LastSession | null = {
  id: 'mock-1',
  type: 'listening',
  title: 'Coffee Shop Talk',
  emoji: '🎧',
  date: '5 phút trước',
  duration: 15,
  progress: 60,
};

interface LastSession {
  id: string;
  type: 'listening' | 'speaking';
  title: string;
  emoji: string;
  date: string;
  duration: number;
  /** Tiến độ bài học: 0-100 */
  progress: number;
}

/**
 * Mục đích: Widget "Tiếp tục bài học" — hiển thị session cuối cùng để resume nhanh
 * Tham số đầu vào: không có
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Dashboard HomeScreen — ngay sau StreakWidget
 *   - Nếu có last session dang dở: card "Tiếp tục: {title}" + progress bar + nút ▶
 *   - Nếu chưa có session nào: card "Bắt đầu bài đầu tiên! ⚡"
 *   - Glassmorphism styling, hỗ trợ dark/light mode
 */
export default function SmartCTA() {
  const navigation = useNavigation();
  const colors = useColors();

  // TODO: Thay bằng API GET /api/user/last-session khi backend ready
  const lastSession = MOCK_LAST_SESSION;

  /**
   * Mục đích: Xử lý khi user nhấn nút tiếp tục / bắt đầu
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút ▶ hoặc CTA trên widget
   */
  const handlePress = () => {
    if (lastSession) {
      // TODO: Navigate tới đúng bài học cụ thể khi có deep link
      const route = lastSession.type === 'listening' ? 'Listening' : 'Speaking';
      navigation.navigate(route as never);
    }
  };

  // ========== Trường hợp chưa có session nào ==========
  if (!lastSession) {
    return (
      <View className="px-4 py-2">
        <TouchableOpacity
          style={{
            backgroundColor: colors.glassBg,
            borderWidth: 1,
            borderColor: colors.glassBorder,
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
          activeOpacity={0.7}
          onPress={() => navigation.navigate('Listening' as never)}>
          {/* Emoji */}
          <AppText className="text-[28px]">⚡</AppText>

          {/* Nội dung */}
          <View className="flex-1">
            <AppText
              className="font-sans-bold text-sm"
              style={{color: colors.foreground}}>
              Bắt đầu bài đầu tiên!
            </AppText>
            <AppText
              className="text-[11px] mt-0.5"
              style={{color: colors.neutrals400}}>
              Chọn kỹ năng và bắt đầu luyện tập
            </AppText>
          </View>

          {/* Mũi tên */}
          <AppText style={{color: colors.neutrals400, fontSize: 16}}>→</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  // ========== Trường hợp có session dang dở ==========
  const progressPercent = Math.min(lastSession.progress, 100);

  return (
    <View className="px-4 py-2">
      <TouchableOpacity
        style={{
          backgroundColor: colors.glassBg,
          borderWidth: 1,
          borderColor: colors.glassBorder,
          borderRadius: 16,
          padding: 16,
          gap: 10,
        }}
        activeOpacity={0.7}
        onPress={handlePress}>
        {/* Hàng trên: emoji + tiêu đề + nút play */}
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          {/* Emoji skill */}
          <AppText className="text-lg">{lastSession.emoji}</AppText>

          {/* Nội dung */}
          <View className="flex-1">
            <AppText
              className="font-sans-bold text-[13px]"
              style={{color: colors.foreground}}>
              Tiếp tục: {lastSession.title}
            </AppText>
            <AppText
              className="text-[11px] mt-0.5"
              style={{color: colors.neutrals400}}>
              {lastSession.date} • {lastSession.duration} phút
            </AppText>
          </View>

          {/* Nút Play */}
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.glassBorderStrong,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <AppText style={{color: colors.foreground, fontSize: 14}}>
              ▶️
            </AppText>
          </View>
        </View>

        {/* Progress bar */}
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.glassBorderStrong,
            overflow: 'hidden',
          }}>
          <View
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              borderRadius: 2,
              backgroundColor: colors.primary,
            }}
          />
        </View>

        {/* Label tiến độ */}
        <AppText
          className="text-[10px]"
          style={{color: colors.neutrals400, textAlign: 'right'}}>
          {progressPercent}% hoàn thành
        </AppText>
      </TouchableOpacity>
    </View>
  );
}
