/**
 * Mục đích: Barrel export cho tất cả Speaking components
 * Khi nào sử dụng: Import components từ '@/components/speaking'
 */
export {default as VoiceVisualizer} from './VoiceVisualizer';
export {default as ChatBubble} from './ChatBubble';
export type {ChatMessage, ChatRole} from './ChatBubble';
export {default as PronunciationAlert} from './PronunciationAlert';
export type {PronunciationCorrection} from './PronunciationAlert';
export {default as GrammarFix} from './GrammarFix';
export type {GrammarCorrection} from './GrammarFix';
export {default as SuggestedResponses} from './SuggestedResponses';
export {default as CountdownOverlay} from './CountdownOverlay';
export {default as RecordingPreview} from './RecordingPreview';
export {default as IPAPopup} from './IPAPopup';
export {default as WaveformComparison} from './WaveformComparison';
export {default as PhonemeHeatmap} from './PhonemeHeatmap';
export {default as ScoreBreakdown} from './ScoreBreakdown';
export {default as ConfettiAnimation} from './ConfettiAnimation';
export {default as ScenarioCard} from './ScenarioCard';
export {default as TurnCounter} from './TurnCounter';
export {default as SpeedChallengeMeter} from './SpeedChallengeMeter';
export {default as RadarChart} from './RadarChart';
export {default as CalendarHeatmap} from './CalendarHeatmap';
export {default as BadgeGrid} from './BadgeGrid';
export {default as DailyGoalCard} from './DailyGoalCard';
export {default as WeakSoundsCard} from './WeakSoundsCard';
export {default as ShareResultCard} from './ShareResultCard';
export {default as OnboardingOverlay} from './OnboardingOverlay';

