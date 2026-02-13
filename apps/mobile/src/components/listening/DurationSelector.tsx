import React, {useCallback, useRef} from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {AppText} from '@/components/ui';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';

/** Tuỳ chọn thời lượng cố định */
const PRESET_DURATIONS = [5, 10, 15] as const;

/** Phạm vi custom duration */
const MIN_DURATION = 5;
const MAX_DURATION = 60;

/** Chiều cao mỗi item trong picker list */
const PICKER_ITEM_HEIGHT = 48;

/** Tạo mảng giá trị duration 5-60 */
const DURATION_VALUES = Array.from(
  {length: MAX_DURATION - MIN_DURATION + 1},
  (_, i) => MIN_DURATION + i,
);

interface DurationSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  disabled?: boolean;
}

/**
 * Mục đích: Component chọn thời lượng bài nghe — compact inline layout
 *   + preset pills (5/10/15) và nút custom mở bottom sheet picker
 * Tham số đầu vào:
 *   - value: số phút hiện tại
 *   - onChange: callback khi đổi duration
 *   - disabled: có disable không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: ConfigScreen → section "Cấu hình cơ bản" → row "Thời lượng"
 */
export default function DurationSelector({
  value,
  onChange,
  disabled = false,
}: DurationSelectorProps) {
  const colors = useColors();
  const isCustom = !PRESET_DURATIONS.includes(value as any);
  const [showPicker, setShowPicker] = React.useState(false);
  const haptic = useHaptic();

  /**
   * Mục đích: Xử lý khi user chọn 1 preset duration
   * Tham số đầu vào: minutes (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào pill 5/10/15
   */
  const handlePreset = (minutes: number) => {
    haptic.light();
    onChange(minutes);
  };

  /**
   * Mục đích: Mở picker bottom sheet để chọn duration tuỳ chỉnh
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút custom (icon bút chì)
   */
  const handleCustomToggle = () => {
    haptic.light();
    setShowPicker(true);
  };

  /**
   * Mục đích: Xử lý khi user chọn giá trị từ picker
   * Tham số đầu vào: minutes (number)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn vào 1 item trong picker list
   */
  const handlePickerSelect = (minutes: number) => {
    haptic.medium();
    onChange(minutes);
    setShowPicker(false);
  };

  return (
    <View>
      {/* Row chính: label trái, pills + custom button phải */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <AppText className="text-foreground font-sans-medium text-sm">
            Thời lượng
          </AppText>
          {/* Badge hiển thị giá trị custom bên cạnh label */}
          {isCustom && (
            <View
              className="ml-2 rounded-lg px-2 py-0.5"
              style={{backgroundColor: `${colors.primary}18`}}>
              <AppText
                className="text-xs font-sans-bold"
                style={{color: colors.primary}}>
                {value} phút
              </AppText>
            </View>
          )}
        </View>

        <View className="flex-row items-center gap-1.5">
          {/* Segmented pills */}
          <View
            className="flex-row rounded-xl overflow-hidden border border-neutrals800"
            style={{backgroundColor: colors.neutrals900}}>
            {PRESET_DURATIONS.map((d, index) => (
              <CompactPill
                key={d}
                label={`${d}`}
                selected={value === d}
                onPress={() => handlePreset(d)}
                disabled={disabled}
                isFirst={index === 0}
                isLast={index === PRESET_DURATIONS.length - 1}
                accessibilityLabel={`${d} phút${value === d ? ', đang chọn' : ''}`}
              />
            ))}
          </View>

          {/* Nút custom — icon nhỏ gọn, mở picker sheet */}
          <CustomIconButton
            active={isCustom}
            onPress={handleCustomToggle}
            disabled={disabled}
          />
        </View>
      </View>

      {/* Bottom sheet picker cho custom duration */}
      <DurationPickerSheet
        visible={showPicker}
        currentValue={value}
        onSelect={handlePickerSelect}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

// ========================
// DurationPickerSheet — bottom sheet cuộn chọn thời lượng
// ========================

interface DurationPickerSheetProps {
  visible: boolean;
  currentValue: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
}

/**
 * Mục đích: Bottom sheet dạng Modal chứa danh sách cuộn 5-60 phút
 *   cho phép user cuộn và chọn giá trị duration tuỳ chỉnh
 * Tham số đầu vào:
 *   - visible: hiện/ẩn modal
 *   - currentValue: giá trị đang chọn (để highlight)
 *   - onSelect: callback khi user chọn giá trị
 *   - onClose: callback khi đóng modal
 * Tham số đầu ra: JSX.Element (Modal)
 * Khi nào sử dụng: DurationSelector → nhấn nút custom → mở sheet này
 */
function DurationPickerSheet({
  visible,
  currentValue,
  onSelect,
  onClose,
}: DurationPickerSheetProps) {
  const colors = useColors();
  const haptic = useHaptic();
  const flatListRef = useRef<FlatList>(null);

  /**
   * Mục đích: Scroll tới giá trị đang được chọn khi modal mở
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Modal onShow — tự động cuộn tới item đang active
   */
  const handleModalShow = useCallback(() => {
    const index = currentValue - MIN_DURATION;
    if (index >= 0 && index < DURATION_VALUES.length) {
      // Delay nhỏ để FlatList render xong rồi mới scroll
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index,
          animated: false,
          viewPosition: 0.4, // Đặt item gần giữa màn hình
        });
      }, 100);
    }
  }, [currentValue]);

  /**
   * Mục đích: Render 1 item duration trong danh sách cuộn
   * Tham số đầu vào: item (number), index (number)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem cho mỗi giá trị 5-60
   */
  const renderItem = useCallback(
    ({item}: {item: number}) => {
      const isSelected = item === currentValue;
      return (
        <PickerItem
          value={item}
          isSelected={isSelected}
          onPress={() => onSelect(item)}
        />
      );
    },
    [currentValue, onSelect],
  );

  /**
   * Mục đích: Tạo key duy nhất cho mỗi item trong FlatList
   * Tham số đầu vào: item (number)
   * Tham số đầu ra: string
   * Khi nào sử dụng: FlatList keyExtractor
   */
  const keyExtractor = useCallback((item: number) => `dur-${item}`, []);

  /**
   * Mục đích: Tính layout cố định cho mỗi item (tối ưu scroll performance)
   * Tham số đầu vào: data, index
   * Tham số đầu ra: {length, offset, index}
   * Khi nào sử dụng: FlatList getItemLayout — tránh async layout measurement
   */
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({
      length: PICKER_ITEM_HEIGHT,
      offset: PICKER_ITEM_HEIGHT * index,
      index,
    }),
    [],
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleModalShow}>
      {/* Backdrop overlay — nhấn để đóng */}
      <Pressable className="flex-1 bg-black/50" onPress={onClose} />

      {/* Sheet content */}
      <View
        className="bg-background rounded-t-3xl px-6 pb-safe-offset-6 pt-4"
        style={{
          maxHeight: '50%',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 20,
        }}>
        {/* Thanh kéo (pill handle) */}
        <View className="w-10 h-1 bg-neutrals600 rounded-full self-center mb-3" />

        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <AppText className="mr-2">⏱️</AppText>
            <View>
              <AppText className="text-foreground font-sans-bold text-lg">
                Chọn thời lượng
              </AppText>
              <AppText className="text-neutrals400 text-xs mt-0.5">
                Cuộn để chọn từ {MIN_DURATION} đến {MAX_DURATION} phút
              </AppText>
            </View>
          </View>
          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            accessibilityLabel="Đóng chọn thời lượng"
            accessibilityRole="button"
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Icon name="X" className="w-6 h-6 text-neutrals400" />
          </TouchableOpacity>
        </View>

        {/* Danh sách cuộn chọn thời lượng */}
        <FlatList
          ref={flatListRef}
          data={DURATION_VALUES}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 16}}
          onScrollToIndexFailed={info => {
            // Xử lý khi scroll tới index thất bại (item chưa render)
            console.warn('⚠️ [DurationPicker] Cuộn tới index thất bại:', info);
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: true,
                viewPosition: 0.4,
              });
            }, 200);
          }}
        />
      </View>
    </Modal>
  );
}

// ========================
// PickerItem — item đơn trong danh sách cuộn
// ========================

interface PickerItemProps {
  value: number;
  isSelected: boolean;
  onPress: () => void;
}

/**
 * Mục đích: Render 1 dòng trong picker list — hiển thị số phút + trạng thái chọn
 *   Có spring animation khi nhấn, highlight khi đang được chọn
 * Tham số đầu vào:
 *   - value: giá trị phút (5-60)
 *   - isSelected: đang được chọn hay không
 *   - onPress: callback khi nhấn
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationPickerSheet → FlatList → renderItem
 */
const PickerItem = React.memo(function PickerItem({
  value,
  isSelected,
  onPress,
}: PickerItemProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  // Kiểm tra xem có phải là preset hay không
  const isPreset = PRESET_DURATIONS.includes(value as any);

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="flex-row items-center justify-between rounded-2xl px-4 mx-1 mb-1"
        style={{
          height: PICKER_ITEM_HEIGHT,
          backgroundColor: isSelected
            ? `${colors.primary}15`
            : 'transparent',
          borderWidth: isSelected ? 1 : 0,
          borderColor: isSelected ? `${colors.primary}40` : 'transparent',
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityLabel={`${value} phút${isSelected ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <View className="flex-row items-center">
          <AppText
            className={`text-base ${
              isSelected ? 'font-sans-bold' : 'font-sans-medium'
            }`}
            style={{
              color: isSelected ? colors.primary : colors.foreground,
            }}>
            {value} phút
          </AppText>
          {/* Badge cho preset nổi bật */}
          {isPreset && (
            <View
              className="ml-2 rounded-md px-1.5 py-0.5"
              style={{backgroundColor: colors.neutrals900}}>
              <AppText className="text-neutrals400 text-[10px]">
                phổ biến
              </AppText>
            </View>
          )}
        </View>

        {/* Check icon cho item đang chọn */}
        {isSelected && (
          <Icon
            name="Check"
            className="w-5 h-5"
            style={{color: colors.primary}}
          />
        )}
      </Pressable>
    </Animated.View>
  );
});

// ========================
// CompactPill — pill nhỏ gọn trong segmented control
// ========================

interface CompactPillProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  accessibilityLabel: string;
}

/**
 * Mục đích: Pill button compact trong segmented control, có spring animation
 * Tham số đầu vào: label, selected, onPress, disabled, isFirst, isLast, accessibilityLabel
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationSelector → mỗi preset pill (5/10/15)
 */
function CompactPill({
  label,
  selected,
  onPress,
  disabled,
  accessibilityLabel,
}: CompactPillProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, {damping: 15, stiffness: 300});
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {damping: 12, stiffness: 200});
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="items-center justify-center"
        style={{
          width: 48,
          height: 36,
          backgroundColor: selected ? `${colors.primary}18` : 'transparent',
          borderColor: selected ? colors.primary : 'transparent',
          borderWidth: selected ? 1 : 0,
          borderRadius: selected ? 10 : 0,
        }}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button">
        <AppText
          className={`font-sans-bold text-sm ${
            selected ? 'text-primary' : 'text-foreground'
          }`}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

// ========================
// CustomIconButton — nút icon bút chì mở picker sheet
// ========================

interface CustomIconButtonProps {
  active: boolean;
  onPress: () => void;
  disabled: boolean;
}

/**
 * Mục đích: Nút icon nhỏ gọn để mở picker chọn duration tuỳ chỉnh
 * Tham số đầu vào: active (đang ở custom mode), onPress, disabled
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: DurationSelector → sau segmented pills
 */
function CustomIconButton({active, onPress, disabled}: CustomIconButtonProps) {
  const scale = useSharedValue(1);
  const colors = useColors();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{scale: scale.value}],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        className="items-center justify-center rounded-xl"
        style={{
          width: 36,
          height: 36,
          backgroundColor: active ? `${colors.primary}18` : colors.neutrals900,
          borderWidth: 1,
          borderColor: active ? colors.primary : colors.neutrals800,
        }}
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9, {damping: 15, stiffness: 300});
        }}
        onPressOut={() => {
          scale.value = withSpring(1, {damping: 12, stiffness: 200});
        }}
        disabled={disabled}
        accessibilityLabel={`Tuỳ chỉnh thời lượng${active ? ', đang chọn' : ''}`}
        accessibilityRole="button">
        <Icon
          name="Pencil"
          className={`w-3.5 h-3.5 ${active ? 'text-primary' : 'text-neutrals400'}`}
        />
      </Pressable>
    </Animated.View>
  );
}
