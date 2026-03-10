import React from 'react';
import {View} from 'react-native';
import Svg, {Circle} from 'react-native-svg';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {calculateGrade} from '@/services/api/speaking';

// =======================
// Types
// =======================

interface ScoreRingProps {
  /** Điểm 0-100 */
  value: number;
  /** Label hiển thị bên dưới (VD: "Rhythm", "Intonation") */
  label?: string;
  /** Icon emoji hiển thị bên dưới label */
  icon?: string;
  /** Kích thước ring (px) — mặc định 80 */
  size?: number;
  /** Độ dày stroke — mặc định 6 */
  strokeWidth?: number;
  /** Màu ring — mặc định auto theo score */
  color?: string;
  /** Hiện grade text (A+, B...) thay vì score number */
  showGrade?: boolean;
}

// =======================
// Helpers
// =======================

/**
 * Mục đích: Lấy màu phù hợp theo điểm số
 * Tham số đầu vào: value (0-100)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: ScoreRing auto-color
 */
function getScoreColor(value: number): string {
  if (value >= 85) return '#22c55e'; // Xanh lá — xuất sắc
  if (value >= 70) return '#60a5fa'; // Xanh dương — khá
  if (value >= 50) return '#facc15'; // Vàng — trung bình
  return '#ef4444'; // Đỏ — cần cải thiện
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị điểm dạng circular progress ring (SVG arc)
 * Tham số đầu vào: value, label, icon, size, strokeWidth, color, showGrade
 * Tham số đầu ra: JSX.Element — vòng tròn SVG + score text ở giữa
 * Khi nào sử dụng:
 *   - ShadowingFeedbackScreen: Overall score ring lớn (size=120)
 *   - ShadowingFeedbackScreen: 3 sub-score rings nhỏ (Rhythm, Intonation, Accuracy)
 *   - SessionSummaryScreen: Average scores
 */
export default function ScoreRing({
  value,
  label,
  icon,
  size = 80,
  strokeWidth = 6,
  color,
  showGrade = false,
}: ScoreRingProps) {
  const colors = useColors();

  // Tính toán kích thước SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const ringColor = color ?? getScoreColor(value);

  // Text hiển thị
  const displayText = showGrade ? calculateGrade(value) : String(Math.round(value));
  const textSize = size >= 100 ? 24 : size >= 60 ? 16 : 12;

  return (
    <View style={{alignItems: 'center'}}>
      {/* SVG Ring */}
      <View style={{width: size, height: size}}>
        <Svg width={size} height={size}>
          {/* Track nền (xám nhạt) */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`${ringColor}20`}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        {/* Score text ở giữa */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <AppText
            style={{
              fontSize: textSize,
              fontWeight: '700',
              color: ringColor,
            }}
            raw>
            {displayText}
          </AppText>
        </View>
      </View>

      {/* Label + Icon */}
      {(label || icon) && (
        <View style={{alignItems: 'center', marginTop: 6}}>
          {icon && (
            <AppText style={{fontSize: 14, marginBottom: 2}} raw>
              {icon}
            </AppText>
          )}
          {label && (
            <AppText
              variant="caption"
              style={{color: colors.neutrals400, textAlign: 'center'}}
              raw>
              {label}
            </AppText>
          )}
        </View>
      )}
    </View>
  );
}
