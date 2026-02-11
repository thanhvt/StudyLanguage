import React, {useEffect} from 'react';
import {Pressable, View} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {cn} from '@/utils';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';

/**
 * Mục đích: Segmented control cho 2-3 lựa chọn (tương tự iOS UISegmentedControl)
 * Tham số đầu vào:
 *   - segments: danh sách segment
 *   - selectedIndex: index segment đang chọn
 *   - onSelect: callback khi chọn segment
 *   - className: custom class
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   - Toggle giữa 2-3 options (Light/Dark/Auto, All/Recent...)
 *   - Style_Convention §1.1 SegmentedControl
 */

interface SegmentedControlProps {
  segments: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export default function SegmentedControl({
  segments,
  selectedIndex,
  onSelect,
  className,
  size = 'md',
}: SegmentedControlProps) {
  const colors = useColors();
  const translateX = useSharedValue(0);
  const segmentWidth = useSharedValue(0);

  useEffect(() => {
    if (segmentWidth.value > 0) {
      translateX.value = withSpring(selectedIndex * segmentWidth.value, {
        damping: 18,
        stiffness: 200,
      });
    }
  }, [selectedIndex, segmentWidth, translateX]);

  // Animated indicator style
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
    width: segmentWidth.value,
  }));

  const heightClass = size === 'sm' ? 'h-9' : 'h-11';

  return (
    <View
      className={cn(
        'flex-row rounded-xl p-1',
        heightClass,
        className,
      )}
      style={{backgroundColor: colors.neutrals800}}
      onLayout={(event) => {
        const containerWidth = event.nativeEvent.layout.width - 8; // trừ padding
        segmentWidth.value = containerWidth / segments.length;
      }}
    >
      {/* Animated indicator nền */}
      <Animated.View
        style={[
          indicatorStyle,
          {
            backgroundColor: colors.surface === '#0a0a0a' ? colors.neutrals700 : '#ffffff',
            borderRadius: 10,
            position: 'absolute',
            top: 4,
            left: 4,
            bottom: 4,
          },
        ]}
      />

      {/* Các segment */}
      {segments.map((segment, index) => (
        <Pressable
          key={index}
          onPress={() => onSelect(index)}
          className="flex-1 items-center justify-center z-10"
        >
          <AppText
            variant={size === 'sm' ? 'bodySmall' : 'body'}
            weight={selectedIndex === index ? 'semibold' : 'regular'}
            className={cn(
              selectedIndex === index ? 'text-foreground' : 'text-neutrals300',
            )}
            raw
          >
            {segment}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}
