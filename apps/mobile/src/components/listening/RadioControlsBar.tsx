/**
 * RadioControlsBar — Controls cho Radio Mode playback
 *
 * Mục đích: Hiển thị các nút điều khiển: sleep timer, speed, shuffle, repeat, delete
 * Tham số đầu vào: onDelete callback
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen render phía dưới playlist
 */
import React, {useState, useCallback} from 'react';
import {TouchableOpacity, View, Alert} from 'react-native';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useRadioStore} from '@/store/useRadioStore';
import {useRadioPlayer} from '@/hooks/useRadioPlayer';
import {useColors} from '@/hooks/useColors';
import {LISTENING_BLUE} from '@/constants/listening';

// Speed options cho cycle
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

// Sleep timer presets (phút)
const SLEEP_PRESETS = [0, 15, 30, 45, 60, 90];

/**
 * Mục đích: Thanh controls phía dưới playlist trong RadioScreen
 * Tham số đầu vào: onDelete — callback khi user xóa playlist
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: RadioScreen phase 2 (playlist đã sẵn sàng)
 */
export default function RadioControlsBar({
  onDelete,
}: {
  onDelete?: () => void;
}) {
  const shuffle = useRadioStore(s => s.shuffle);
  const repeat = useRadioStore(s => s.repeat);
  const playbackSpeed = useRadioStore(s => s.playbackSpeed);
  const sleepTimerMinutes = useRadioStore(s => s.sleepTimerMinutes);
  const toggleShuffle = useRadioStore(s => s.toggleShuffle);
  const cycleRepeat = useRadioStore(s => s.cycleRepeat);
  const setSleepTimer = useRadioStore(s => s.setSleepTimer);
  const {setSpeed} = useRadioPlayer();
  const colors = useColors();

  const [showSleepPicker, setShowSleepPicker] = useState(false);

  /**
   * Mục đích: Cycle qua các tốc độ phát
   * Khi nào sử dụng: User nhấn nút speed
   */
  const handleSpeedCycle = useCallback(async () => {
    const currentIdx = SPEED_OPTIONS.indexOf(playbackSpeed);
    const nextIdx = (currentIdx + 1) % SPEED_OPTIONS.length;
    await setSpeed(SPEED_OPTIONS[nextIdx]);
  }, [playbackSpeed, setSpeed]);

  /**
   * Mục đích: Hiện Alert chọn sleep timer
   * Khi nào sử dụng: User nhấn nút sleep
   */
  const handleSleepTimer = useCallback(() => {
    Alert.alert(
      '😴 Hẹn giờ tắt',
      sleepTimerMinutes > 0
        ? `Đang hẹn: ${sleepTimerMinutes} phút`
        : 'Chọn thời gian tự tắt',
      [
        ...SLEEP_PRESETS.map(min => ({
          text: min === 0 ? '❌ Tắt hẹn giờ' : `${min} phút`,
          onPress: () => setSleepTimer(min),
          style: min === sleepTimerMinutes ? 'destructive' as const : 'default' as const,
        })),
        {text: 'Huỷ', style: 'cancel' as const},
      ],
    );
  }, [sleepTimerMinutes, setSleepTimer]);

  /**
   * Mục đích: Xác nhận xóa playlist
   * Khi nào sử dụng: User nhấn nút delete
   */
  const handleDelete = useCallback(() => {
    Alert.alert(
      'Xóa playlist?',
      'Playlist sẽ bị xóa vĩnh viễn. Không thể hoàn tác.',
      [
        {text: 'Huỷ', style: 'cancel'},
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: onDelete,
        },
      ],
    );
  }, [onDelete]);

  // Icon repeat dựa trên mode
  const repeatIcon = repeat === 'one' ? 'Repeat1' : 'Repeat';
  const repeatActive = repeat !== 'off';

  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center justify-between">
        {/* Shuffle */}
        <TouchableOpacity
          onPress={toggleShuffle}
          className="items-center py-2 px-3"
          accessibilityLabel={shuffle ? 'Tắt trộn bài' : 'Bật trộn bài'}
          accessibilityRole="button">
          <Icon
            name="Shuffle"
            className="w-5 h-5"
            style={{color: shuffle ? LISTENING_BLUE : colors.neutrals400}}
          />
          <AppText
            className="text-xs mt-0.5"
            style={{color: shuffle ? LISTENING_BLUE : colors.neutrals400}}>
            Trộn
          </AppText>
        </TouchableOpacity>

        {/* Repeat */}
        <TouchableOpacity
          onPress={cycleRepeat}
          className="items-center py-2 px-3"
          accessibilityLabel={`Lặp: ${repeat}`}
          accessibilityRole="button">
          <Icon
            name={repeatIcon}
            className="w-5 h-5"
            style={{color: repeatActive ? LISTENING_BLUE : colors.neutrals400}}
          />
          <AppText
            className="text-xs mt-0.5"
            style={{color: repeatActive ? LISTENING_BLUE : colors.neutrals400}}>
            {repeat === 'off' ? 'Lặp' : repeat === 'all' ? 'Tất cả' : '1 bài'}
          </AppText>
        </TouchableOpacity>

        {/* Speed */}
        <TouchableOpacity
          onPress={handleSpeedCycle}
          className="items-center py-2 px-3"
          accessibilityLabel={`Tốc độ ${playbackSpeed}x`}
          accessibilityRole="button">
          <AppText
            className="text-sm font-sans-bold"
            style={{color: playbackSpeed !== 1.0 ? LISTENING_BLUE : colors.neutrals400}}>
            {playbackSpeed}x
          </AppText>
          <AppText
            className="text-xs mt-0.5"
            style={{color: playbackSpeed !== 1.0 ? LISTENING_BLUE : colors.neutrals400}}>
            Tốc độ
          </AppText>
        </TouchableOpacity>

        {/* Sleep Timer */}
        <TouchableOpacity
          onPress={handleSleepTimer}
          className="items-center py-2 px-3"
          accessibilityLabel={
            sleepTimerMinutes > 0
              ? `Hẹn giờ: ${sleepTimerMinutes} phút`
              : 'Hẹn giờ tắt'
          }
          accessibilityRole="button">
          <Icon
            name="Moon"
            className="w-5 h-5"
            style={{color: sleepTimerMinutes > 0 ? LISTENING_BLUE : colors.neutrals400}}
          />
          <AppText
            className="text-xs mt-0.5"
            style={{color: sleepTimerMinutes > 0 ? LISTENING_BLUE : colors.neutrals400}}>
            {sleepTimerMinutes > 0 ? `${sleepTimerMinutes}'` : 'Ngủ'}
          </AppText>
        </TouchableOpacity>

        {/* Delete */}
        <TouchableOpacity
          onPress={handleDelete}
          className="items-center py-2 px-3"
          accessibilityLabel="Xóa playlist"
          accessibilityRole="button">
          <Icon
            name="Trash2"
            className="w-5 h-5"
            style={{color: colors.error}}
          />
          <AppText
            className="text-xs mt-0.5"
            style={{color: colors.error}}>
            Xóa
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
