import React, {useMemo} from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import Svg, {Circle, G, Text as SvgText} from 'react-native-svg';
import {getAccentColor, type SkillType} from '@/utils/historyHelpers';

/**
 * Mục đích: Biểu đồ donut chart hiển thị tỷ lệ Nghe/Nói/Đọc sử dụng react-native-svg
 * Tham số đầu vào:
 *   - listening: number — số bài nghe
 *   - speaking: number — số bài nói
 *   - reading: number — số bài đọc
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Analytics section → skill distribution
 *
 * Sử dụng SVG Circle strokeDasharray technique tạo donut chart.
 * Mỗi segment là 1 Circle với rotation offset tương ứng.
 */

interface SkillDistributionProps {
  listening?: number;
  speaking?: number;
  reading?: number;
}

const SKILLS: {key: SkillType; icon: string; label: string; color: string}[] = [
  {key: 'listening', icon: '🎧', label: 'Nghe', color: '#38bdf8'},
  {key: 'speaking', icon: '🗣️', label: 'Nói', color: '#a78bfa'},
  {key: 'reading', icon: '📖', label: 'Đọc', color: '#fb923c'},
];

// Donut chart dimensions
const SIZE = 140;
const STROKE_WIDTH = 20;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const CENTER = SIZE / 2;

export const SkillDistribution = React.memo(function SkillDistribution({
  listening = 0,
  speaking = 0,
  reading = 0,
}: SkillDistributionProps) {
  const total = listening + speaking + reading;
  const hasData = total > 0;

  // Dùng data thật hoặc placeholder
  const counts: Record<SkillType, number> = hasData
    ? {listening, speaking, reading}
    : {listening: 45, speaking: 30, reading: 25};
  const displayTotal = hasData ? total : 100;

  /**
   * Mục đích: Tính segments cho donut chart
   * Tham số đầu vào: counts record
   * Tham số đầu ra: Array of {color, percentage, dashArray, dashOffset, rotation}
   * Khi nào sử dụng: SVG render
   */
  const segments = useMemo(() => {
    let offset = 0;
    return SKILLS.map(skill => {
      const count = counts[skill.key];
      const percentage = displayTotal > 0 ? count / displayTotal : 0;
      const strokeLength = CIRCUMFERENCE * percentage;
      const gapLength = CIRCUMFERENCE - strokeLength;
      const rotation = offset * 360 - 90; // -90 để bắt đầu từ 12h

      const segment = {
        ...skill,
        count,
        percentage: Math.round(percentage * 100),
        strokeDasharray: `${strokeLength} ${gapLength}`,
        rotation,
      };

      offset += percentage;
      return segment;
    });
  }, [counts, displayTotal]);

  return (
    <View className="mx-4 mb-4 p-4 bg-surface-raised rounded-2xl border border-border">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <AppText className="text-sm">🎯</AppText>
        <AppText className="text-foreground font-sans-semibold">
          Phân bổ kỹ năng
        </AppText>
        {!hasData && (
          <AppText className="text-neutrals500 text-xs">(Dữ liệu mẫu)</AppText>
        )}
      </View>

      {/* Donut chart + Legend Row */}
      <View className="flex-row items-center">
        {/* SVG Donut */}
        <View style={{width: SIZE, height: SIZE}}>
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            {/* Background ring */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS}
              stroke="#262626"
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />

            {/* Segments */}
            {segments.map(segment => (
              <Circle
                key={segment.key}
                cx={CENTER}
                cy={CENTER}
                r={RADIUS}
                stroke={segment.color}
                strokeWidth={STROKE_WIDTH}
                strokeDasharray={segment.strokeDasharray}
                strokeLinecap="round"
                fill="transparent"
                rotation={segment.rotation}
                origin={`${CENTER}, ${CENTER}`}
              />
            ))}

            {/* Center text */}
            <G>
              <SvgText
                x={CENTER}
                y={CENTER - 6}
                textAnchor="middle"
                fill="#e5e5e5"
                fontSize={22}
                fontWeight="bold">
                {displayTotal}
              </SvgText>
              <SvgText
                x={CENTER}
                y={CENTER + 12}
                textAnchor="middle"
                fill="#737373"
                fontSize={10}>
                bài
              </SvgText>
            </G>
          </Svg>
        </View>

        {/* Legend */}
        <View className="flex-1 ml-5 gap-3.5">
          {segments.map(segment => (
            <View key={segment.key} className="flex-row items-center">
              {/* Color dot */}
              <View
                className="w-3.5 h-3.5 rounded-full mr-3"
                style={{backgroundColor: segment.color}}
              />

              {/* Icon + Label */}
              <AppText className="text-sm mr-1.5">{segment.icon}</AppText>
              <AppText className="text-foreground text-sm font-sans-medium flex-1">
                {segment.label}
              </AppText>

              {/* Count + Percentage */}
              <View className="items-end">
                <AppText className="text-foreground text-sm font-sans-bold">
                  {segment.percentage}%
                </AppText>
                <AppText className="text-neutrals400 text-[10px]">
                  {segment.count} bài
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
});
