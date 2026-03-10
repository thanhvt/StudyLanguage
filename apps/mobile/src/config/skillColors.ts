/**
 * Mục đích: Tập trung màu đặc trưng cho từng kỹ năng (Listening, Speaking, Reading)
 * Tham số đầu vào: không có
 * Tham số đầu ra: SKILL_COLORS object, getSkillColor helper
 * Khi nào sử dụng:
 *   - Khi cần accent color cho skill (card borders, icons, badges)
 *   - Import ở SplashScreen, OnboardingScreen, LoginScreen, SessionCard, FeatureCard, vv...
 *   - Thay thế các hardcoded hex colors (#6366F1, #4ade80, #fbbf24)
 */

export type SkillType = 'listening' | 'speaking' | 'reading';

// Màu cho từng kỹ năng, chia theo Light / Dark mode
export const SKILL_COLORS = {
  listening: {light: '#4F46E5', dark: '#6366F1'},
  speaking: {light: '#16A34A', dark: '#4ade80'},
  reading: {light: '#D97706', dark: '#fbbf24'},
} as const;

// Emoji đại diện cho từng kỹ năng
export const SKILL_EMOJIS: Record<SkillType, string> = {
  listening: '🎧',
  speaking: '🗣️',
  reading: '📖',
} as const;

// Label tiếng Việt cho từng kỹ năng
export const SKILL_LABELS: Record<SkillType, string> = {
  listening: 'Luyện Nghe',
  speaking: 'Luyện Nói',
  reading: 'Luyện Đọc',
} as const;

// Màu accent cho AI Conversation sub-modes
export const CONVERSATION_COLORS = {
  freeTalk: {light: '#16A34A', dark: '#4ade80'},
  roleplay: {light: '#EA580C', dark: '#F97316'},
} as const;

/** Lấy accent color cho AI Conversation dựa trên mode */
export function getConversationColor(
  mode: 'free-talk' | 'roleplay',
  theme: 'light' | 'dark' = 'dark',
): string {
  return mode === 'free-talk'
    ? CONVERSATION_COLORS.freeTalk[theme]
    : CONVERSATION_COLORS.roleplay[theme];
}

/**
 * Mục đích: Lấy màu skill dựa trên theme hiện tại
 * Tham số đầu vào: skill (SkillType), theme ('light' | 'dark')
 * Tham số đầu ra: string - hex color
 * Khi nào sử dụng: Trong component cần skill color theo theme
 */
export function getSkillColor(
  skill: SkillType,
  theme: 'light' | 'dark' = 'dark',
): string {
  return SKILL_COLORS[skill][theme];
}
