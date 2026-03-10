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
  /** Hiện grade badge circle ở góc trên phải ring */
  showGradeBadge?: boolean;
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

/**
 * Mục đích: Lấy màu cho grade badge
 * Tham số đầu vào: grade (string)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: ScoreRing grade badge
 */
function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#22c55e';
  if (grade.startsWith('B')) return '#3B82F6';
  if (grade.startsWith('C')) return '#f59e0b';
  if (grade === 'D') return '#F97316';
  return '#ef4444';
}

// =======================
// Component
// =======================

/**
 * Mục đích: Hiển thị điểm dạng circular progress ring (SVG arc)
 * Tham số đầu vào: value, label, icon, size, strokeWidth, color, showGrade, showGradeBadge
 * Tham số đầu ra: JSX.Element — vòng tròn SVG + score text ở giữa
 * Khi nào sử dụng:
 *   - FeedbackScreen: Overall score ring lớn (size=140) + grade badge
 *   - ShadowingFeedbackScreen: 3 sub-score rings nhỏ
 */
export default function ScoreRing({
  value,
  label,
  icon,
  size = 80,
  strokeWidth = 6,
  color,
  showGrade = false,
  showGradeBadge = false,
}: ScoreRingProps) {
  const colors = useColors();

  // Tính toán kích thước SVG
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(100, value));
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const ringColor = color ?? getScoreColor(value);

  // Grade badge
  const grade = calculateGrade(value);
  const gradeColor = getGradeColor(grade);

  // Text hiển thị
  const displayText = showGrade ? grade : String(Math.round(value));
  const textSize = size >= 100 ? 28 : size >= 60 ? 16 : 12;

  return (
    <View style={{alignItems: 'center'}}>
      {/* SVG Ring + Grade badge wrapper */}
      <View style={{width: size + 20, height: size + 10, alignItems: 'center', justifyContent: 'center'}}>
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

          {/* Score text ở giữa — format: 85/100 */}
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
            <View style={{flexDirection: 'row', alignItems: 'baseline'}}>
              <AppText
                style={{
                  fontSize: textSize,
                  fontWeight: '700',
                  color: ringColor,
                }}
                raw>
                {displayText}
              </AppText>
              {!showGrade && size >= 100 && (
                <AppText
                  style={{
                    fontSize: textSize * 0.45,
                    fontWeight: '500',
                    color: `${ringColor}80`,
                    marginLeft: 1,
                  }}
                  raw>
                  /100
                </AppText>
              )}
            </View>
          </View>
        </View>

        {/* Grade badge — hình tròn nhỏ gắn ở góc phải trên của ring */}
        {showGradeBadge && grade && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: gradeColor,
              alignItems: 'center',
              justifyContent: 'center',
              // Shadow cho nổi bật
              shadowColor: gradeColor,
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.4,
              shadowRadius: 4,
              elevation: 4,
            }}>
            <AppText
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: '#FFFFFF',
              }}
              raw>
              {grade}
            </AppText>
          </View>
        )}
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
