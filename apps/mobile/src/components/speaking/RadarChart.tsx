import React from 'react';
import {View, StyleSheet} from 'react-native';
import Svg, {Circle, Line, Polygon, Text as SvgText} from 'react-native-svg';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';

// =======================
// Types
// =======================

interface RadarDataPoint {
  /** Tên trục */
  label: string;
  /** Giá trị 0-100 */
  value: number;
}

interface RadarChartProps {
  /** Dữ liệu các trục */
  data: RadarDataPoint[];
  /** Kích thước chart */
  size?: number;
}

// =======================
// Component
// =======================

/**
 * Mục đích: Biểu đồ radar hiển thị kỹ năng nói đa chiều
 * Tham số đầu vào: data — {label, value}[], size
 * Tham số đầu ra: JSX.Element — SVG radar chart
 * Khi nào sử dụng:
 *   - ProgressDashboardScreen: tổng quan kỹ năng
 *   - FeedbackScreen: (tùy chọn) so sánh nhiều chiều
 */
export default function RadarChart({data, size = 200}: RadarChartProps) {
  const colors = useColors();
  const speakingColor = SKILL_COLORS.speaking.dark;
  const center = size / 2;
  const radius = size / 2 - 30;
  const levels = 4; // Số vòng tròn đồng tâm
  const angleStep = (2 * Math.PI) / data.length;

  /**
   * Mục đích: Tính toạ độ x,y từ góc + khoảng cách
   * Tham số đầu vào: angle (radian), dist (pixel)
   * Tham số đầu ra: {x, y}
   * Khi nào sử dụng: Vẽ polygon + label
   */
  const getPoint = (angle: number, dist: number) => ({
    x: center + dist * Math.sin(angle),
    y: center - dist * Math.cos(angle),
  });

  // Polygon points cho data
  const dataPoints = data.map((d, i) => {
    const r = (d.value / 100) * radius;
    return getPoint(i * angleStep, r);
  });
  const polygonStr = dataPoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <View style={[styles.container, {backgroundColor: colors.surface}]}>
      <Svg width={size} height={size}>
        {/* Vòng tròn nền (levels) */}
        {Array.from({length: levels}, (_, i) => {
          const r = ((i + 1) / levels) * radius;
          return (
            <Circle
              key={`level-${i}`}
              cx={center}
              cy={center}
              r={r}
              stroke={colors.neutrals200 || '#333'}
              strokeWidth={0.5}
              fill="none"
            />
          );
        })}

        {/* Trục từ tâm ra ngoài */}
        {data.map((_, i) => {
          const p = getPoint(i * angleStep, radius);
          return (
            <Line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={p.x}
              y2={p.y}
              stroke={colors.neutrals200 || '#333'}
              strokeWidth={0.5}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={polygonStr}
          fill={`${speakingColor}30`}
          stroke={speakingColor}
          strokeWidth={2}
        />

        {/* Data points (dots) */}
        {dataPoints.map((p, i) => (
          <Circle
            key={`dot-${i}`}
            cx={p.x}
            cy={p.y}
            r={4}
            fill={speakingColor}
          />
        ))}

        {/* Labels */}
        {data.map((d, i) => {
          const labelDist = radius + 18;
          const p = getPoint(i * angleStep, labelDist);
          return (
            <SvgText
              key={`label-${i}`}
              x={p.x}
              y={p.y}
              fontSize={10}
              fill={colors.foreground || '#CCC'}
              textAnchor="middle"
              alignmentBaseline="central">
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
});
