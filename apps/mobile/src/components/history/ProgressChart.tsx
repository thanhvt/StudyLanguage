import React, {useMemo} from 'react';
import {View} from 'react-native';
import {AppText} from '@/components/ui';
import Svg, {Rect, Line, Text as SvgText, G} from 'react-native-svg';

/**
 * Mục đích: Biểu đồ tiến trình học tập sử dụng react-native-svg cho bar chart đẹp hơn
 * Tham số đầu vào:
 *   - data: {date: string; count: number; byType}[] — dữ liệu weekly
 *   - period: string — label khoảng thời gian
 *   - showBySkill: boolean — hiển thị bar chart stacked theo skill
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: HistoryScreen analytics section → progress over time
 *
 * Note: Sử dụng react-native-svg trực tiếp thay vì victory-native
 * để tránh version mismatches và giữ bundle size nhỏ.
 */

interface ChartData {
  date: string;
  count: number;
  byType?: {
    listening: number;
    speaking: number;
    reading: number;
  };
}

interface ProgressChartProps {
  data?: ChartData[];
  period?: string;
  showBySkill?: boolean;
}

// Labels ngày trong tuần
const DAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// Skill colors
const SKILL_COLORS = {
  listening: '#38bdf8', // Sky-400
  speaking: '#a78bfa', // Violet-400
  reading: '#fb923c', // Orange-400
};

// Chart dimensions
const CHART_WIDTH = 320;
const CHART_HEIGHT = 160;
const PADDING = {top: 15, bottom: 30, left: 30, right: 10};
const PLOT_WIDTH = CHART_WIDTH - PADDING.left - PADDING.right;
const PLOT_HEIGHT = CHART_HEIGHT - PADDING.top - PADDING.bottom;

export const ProgressChart = React.memo(function ProgressChart({
  data = [],
  period = 'Tuần này',
  showBySkill = false,
}: ProgressChartProps) {
  // Dùng data hoặc placeholder
  const chartData = useMemo(() => {
    if (data.length > 0) return data.slice(-7);

    return DAY_LABELS.map(() => ({
      date: '',
      count: Math.floor(Math.random() * 8) + 1,
      byType: {
        listening: Math.floor(Math.random() * 4),
        speaking: Math.floor(Math.random() * 3),
        reading: Math.floor(Math.random() * 3),
      },
    }));
  }, [data]);

  // Tính max value
  const maxCount = useMemo(() => {
    if (showBySkill) {
      return Math.max(
        ...chartData.map(
          d =>
            (d.byType?.listening || 0) +
            (d.byType?.speaking || 0) +
            (d.byType?.reading || 0),
        ),
        1,
      );
    }
    return Math.max(...chartData.map(d => d.count), 1);
  }, [chartData, showBySkill]);

  // Bar width + gap
  const barGap = 8;
  const barWidth = (PLOT_WIDTH - barGap * (chartData.length - 1)) / chartData.length;

  // Grid lines
  const gridLines = useMemo(() => {
    const lines = [];
    const step = Math.ceil(maxCount / 4);
    for (let i = 0; i <= maxCount; i += step) {
      const y = PADDING.top + PLOT_HEIGHT - (i / maxCount) * PLOT_HEIGHT;
      lines.push({value: i, y});
    }
    return lines;
  }, [maxCount]);

  return (
    <View className="mx-4 mb-4 bg-surface-raised rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-4 pb-1">
        <View className="flex-row items-center gap-2">
          <AppText className="text-sm">📈</AppText>
          <AppText className="text-foreground font-sans-semibold">
            Tiến trình
          </AppText>
        </View>
        <AppText className="text-neutrals400 text-xs font-sans-medium">
          {period}
        </AppText>
      </View>

      {/* SVG Bar Chart */}
      <View className="items-center px-2">
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <G key={idx}>
              <Line
                x1={PADDING.left}
                y1={line.y}
                x2={CHART_WIDTH - PADDING.right}
                y2={line.y}
                stroke="#262626"
                strokeDasharray="4"
              />
              <SvgText
                x={PADDING.left - 5}
                y={line.y + 3}
                textAnchor="end"
                fill="#737373"
                fontSize={9}>
                {line.value}
              </SvgText>
            </G>
          ))}

          {/* X axis line */}
          <Line
            x1={PADDING.left}
            y1={PADDING.top + PLOT_HEIGHT}
            x2={CHART_WIDTH - PADDING.right}
            y2={PADDING.top + PLOT_HEIGHT}
            stroke="#262626"
          />

          {/* Bars */}
          {chartData.map((item, idx) => {
            const x = PADDING.left + idx * (barWidth + barGap);
            const isToday = idx === chartData.length - 1;

            if (showBySkill && item.byType) {
              // Stacked bars
              const skills = [
                {count: item.byType.listening, color: SKILL_COLORS.listening},
                {count: item.byType.speaking, color: SKILL_COLORS.speaking},
                {count: item.byType.reading, color: SKILL_COLORS.reading},
              ];

              let yOffset = PADDING.top + PLOT_HEIGHT;
              return (
                <G key={idx}>
                  {skills.map((skill, sIdx) => {
                    const height = (skill.count / maxCount) * PLOT_HEIGHT;
                    yOffset -= height;
                    return (
                      <Rect
                        key={sIdx}
                        x={x}
                        y={yOffset}
                        width={barWidth}
                        height={Math.max(height, 0)}
                        fill={skill.color}
                        rx={sIdx === skills.length - 1 ? 3 : 0}
                        ry={sIdx === skills.length - 1 ? 3 : 0}
                      />
                    );
                  })}
                  {/* Day label */}
                  <SvgText
                    x={x + barWidth / 2}
                    y={PADDING.top + PLOT_HEIGHT + 16}
                    textAnchor="middle"
                    fill="#737373"
                    fontSize={9}>
                    {DAY_LABELS[idx]}
                  </SvgText>
                </G>
              );
            }

            // Single bars
            const barHeight = (item.count / maxCount) * PLOT_HEIGHT;
            const barY = PADDING.top + PLOT_HEIGHT - barHeight;

            return (
              <G key={idx}>
                <Rect
                  x={x}
                  y={barY}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  fill={isToday ? '#4ade80' : 'rgba(74, 222, 128, 0.35)'}
                  rx={4}
                  ry={4}
                />
                {/* Value label */}
                {item.count > 0 && (
                  <SvgText
                    x={x + barWidth / 2}
                    y={barY - 4}
                    textAnchor="middle"
                    fill="#a3a3a3"
                    fontSize={9}>
                    {item.count}
                  </SvgText>
                )}
                {/* Day label */}
                <SvgText
                  x={x + barWidth / 2}
                  y={PADDING.top + PLOT_HEIGHT + 16}
                  textAnchor="middle"
                  fill={isToday ? '#4ade80' : '#737373'}
                  fontSize={9}
                  fontWeight={isToday ? 'bold' : 'normal'}>
                  {DAY_LABELS[idx]}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>

      {/* Legend cho skill mode */}
      {showBySkill && (
        <View className="flex-row items-center justify-center gap-4 pb-3">
          {Object.entries(SKILL_COLORS).map(([key, color]) => (
            <View key={key} className="flex-row items-center gap-1.5">
              <View className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: color}} />
              <AppText className="text-neutrals400 text-[10px] font-sans-medium">
                {key === 'listening' ? 'Nghe' : key === 'speaking' ? 'Nói' : 'Đọc'}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
});
