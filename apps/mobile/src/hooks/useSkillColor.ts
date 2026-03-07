import {useAppStore} from '@/store/useAppStore';
import {SKILL_COLORS, SkillType} from '@/config/skillColors';

/**
 * Mục đích: Lấy accent color của 1 skill theo theme hiện tại (light/dark)
 * Tham số đầu vào: skill (SkillType) — 'listening' | 'speaking' | 'reading'
 * Tham số đầu ra: string — hex color phù hợp với theme
 * Khi nào sử dụng:
 *   - Thay thế pattern `SKILL_COLORS.speaking.dark` (hardcode dark) bằng hook theme-aware
 *   - Mọi component cần skill accent color: buttons, borders, tints, shadows
 *   - Ví dụ: const speakingColor = useSkillColor('speaking');
 */
export function useSkillColor(skill: SkillType): string {
  const theme = useAppStore(state => state.theme);
  return SKILL_COLORS[skill][theme === 'light' ? 'light' : 'dark'];
}
