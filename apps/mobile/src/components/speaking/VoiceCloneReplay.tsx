import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, Switch} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import WaveformComparison from '@/components/speaking/WaveformComparison';

// ============================================
// TYPES
// ============================================

interface VoiceCloneReplayProps {
  /** Câu gốc user đọc */
  sentence: string;
  /** Điểm phát âm tổng */
  score: number;
  /** URI file audio user ghi */
  userAudioUri: string | null;
  /** URL audio AI đã sửa */
  correctedAudioUrl: string | null;
  /** Danh sách cải tiến phoneme */
  improvements: VoiceImprovement[];
  /** Dữ liệu waveform bản gốc */
  userWaveform?: number[];
  /** Dữ liệu waveform bản AI */
  aiWaveform?: number[];
  /** Thuộc tính audio user (giây) */
  userDuration?: number;
  /** Thuộc tính audio AI (giây) */
  aiDuration?: number;
  /** Callback gọi khi user nhấn "AI sửa" mà chưa có correctedAudioUrl */
  onRequestClone?: () => void;
  /** Trạng thái đang tải bản sửa */
  isLoading?: boolean;
}

/** Type cho improvement — export cho FeedbackScreen */
export interface VoiceImprovement {
  phoneme: string;
  before: string;
  after: string;
}

/** Trạng thái playback cho A/B compare */
type PlaybackState = 'idle' | 'user' | 'ai' | 'compare';

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Component so sánh A/B giữa bản ghi user và AI (Voice Clone Replay)
 * Tham số đầu vào: VoiceCloneReplayProps (sentence, score, audio URLs, improvements)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: FeedbackScreen → tab "Voice Clone" → hiển thị so sánh A/B
 */
export default function VoiceCloneReplay({
  sentence,
  score,
  userAudioUri,
  correctedAudioUrl,
  improvements,
  userWaveform = [],
  aiWaveform = [],
  userDuration = 0,
  aiDuration = 0,
  onRequestClone,
  isLoading = false,
}: VoiceCloneReplayProps) {
  const colors = useColors();
  const haptic = useHaptic();

  // Playback state
  const [playback, setPlayback] = useState<PlaybackState>('idle');
  const [autoLoop, setAutoLoop] = useState(false);

  /**
   * Mục đích: Phát audio bản gốc user
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap card "Bản gốc"
   */
  const playUserAudio = useCallback(() => {
    haptic.light();
    if (playback === 'user') {
      setPlayback('idle');
      console.log('⏸️ [VoiceClone] Dừng audio user');
      // TODO: AudioRecorderPlayer.stopPlayer()
      return;
    }
    // Edge: Dừng audio khác trước khi phát (audio overlap prevention)
    // TODO: AudioRecorderPlayer.stopPlayer() trước khi play mới
    setPlayback('user');
    console.log('🔊 [VoiceClone] Phát bản gốc:', userAudioUri);
    // TODO: AudioRecorderPlayer.startPlayer(userAudioUri)
  }, [playback, userAudioUri, haptic]);

  /**
   * Mục đích: Phát audio bản AI đã sửa
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap card "AI đã sửa"
   */
  const playAIAudio = useCallback(() => {
    haptic.light();
    // Nếu chưa có correctedAudioUrl → gọi onRequestClone để fetch
    if (!correctedAudioUrl && onRequestClone) {
      onRequestClone();
      return;
    }
    if (playback === 'ai') {
      setPlayback('idle');
      console.log('⏸️ [VoiceClone] Dừng audio AI');
      return;
    }
    setPlayback('ai');
    console.log('🔊 [VoiceClone] Phát bản AI:', correctedAudioUrl);
  }, [playback, correctedAudioUrl, haptic, onRequestClone]);

  /**
   * Mục đích: Phát so sánh A/B (xen kẽ user → AI → user → AI)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap card "So sánh A/B"
   */
  const playCompare = useCallback(() => {
    haptic.medium();
    if (playback === 'compare') {
      setPlayback('idle');
      console.log('⏸️ [VoiceClone] Dừng so sánh A/B');
      return;
    }
    setPlayback('compare');
    console.log('🔄 [VoiceClone] Bắt đầu so sánh A/B | auto-loop:', autoLoop);
    // TODO: Phát xen kẽ user audio → AI audio, lặp nếu autoLoop
  }, [playback, autoLoop, haptic]);

  const scoreColor = score >= 90 ? '#22C55E' : score >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <View style={{gap: 16}}>
      {/* Target sentence header */}
      <View style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderLeftWidth: 3,
        borderLeftColor: '#22C55E',
      }}>
        <AppText variant="caption" style={{color: colors.neutrals400, marginBottom: 4}}>
          📝 Câu mẫu
        </AppText>
        <AppText variant="body" weight="semibold">
          {sentence}
        </AppText>
      </View>

      {/* Card 1: Bản gốc user (MỚI: thêm score badge) */}
      <AudioCard
        title="🎙️ Bản gốc của bạn"
        isPlaying={playback === 'user'}
        onPress={playUserAudio}
        accentColor="#3B82F6"
        surfaceColor={colors.surface}
        rightContent={
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            {userDuration > 0 && (
              <AppText variant="caption" style={{color: colors.neutrals400}}>
                {userDuration.toFixed(1)}s
              </AppText>
            )}
            <View style={{
              paddingVertical: 3,
              paddingHorizontal: 8,
              borderRadius: 8,
              backgroundColor: scoreColor + '15',
            }}>
              <AppText variant="caption" weight="bold" style={{color: scoreColor}}>
                {score}/100
              </AppText>
            </View>
          </View>
        }
      >
        {/* Waveform user */}
        {userWaveform.length > 0 && (
          <WaveformComparison aiWaveform={aiWaveform} userWaveform={userWaveform} height={40} />
        )}
      </AudioCard>

      {/* Card 2: AI đã sửa */}
      <AudioCard
        title="🤖 AI đã sửa phát âm"
        isPlaying={playback === 'ai'}
        onPress={playAIAudio}
        accentColor="#22C55E"
        surfaceColor={colors.surface}
        rightContent={
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
            {aiDuration > 0 && (
              <AppText variant="caption" style={{color: colors.neutrals400}}>
                {aiDuration.toFixed(1)}s
              </AppText>
            )}
            <AppText variant="caption" style={{color: '#22C55E'}}>
              ✨ Phát âm chuẩn — AI voice clone
            </AppText>
          </View>
        }
      >
        {/* Waveform AI */}
        {aiWaveform.length > 0 && (
          <WaveformComparison aiWaveform={aiWaveform} userWaveform={userWaveform} height={40} />
        )}
      </AudioCard>

      {/* Card 3: So sánh A/B (MỚI) */}
      <View style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: colors.surface,
        borderWidth: playback === 'compare' ? 1.5 : 0,
        borderColor: '#8B5CF6',
      }}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
          <AppText variant="body" weight="semibold">
            🔄 So sánh A/B
          </AppText>
          {/* Auto-loop toggle */}
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
            <AppText variant="caption" style={{color: colors.neutrals400}}>
              🔁 Loop
            </AppText>
            <Switch
              value={autoLoop}
              onValueChange={setAutoLoop}
              trackColor={{false: colors.neutrals400 + '40', true: '#F59E0B60'}}
              thumbColor={autoLoop ? '#F59E0B' : colors.neutrals400}
              style={{transform: [{scale: 0.8}]}}
            />
          </View>
        </View>

        {/* So sánh split waveform */}
        <View style={{flexDirection: 'row', gap: 8, marginBottom: 10}}>
          <View style={{flex: 1, alignItems: 'center'}}>
            <AppText variant="caption" style={{color: '#3B82F6', marginBottom: 4}}>Bạn</AppText>
            {userWaveform.length > 0 && (
              <WaveformComparison aiWaveform={[]} userWaveform={userWaveform} height={30} />
            )}
          </View>
          <View style={{width: 1, backgroundColor: colors.neutrals400 + '30'}} />
          <View style={{flex: 1, alignItems: 'center'}}>
            <AppText variant="caption" style={{color: '#22C55E', marginBottom: 4}}>AI</AppText>
            {aiWaveform.length > 0 && (
              <WaveformComparison aiWaveform={aiWaveform} userWaveform={[]} height={30} />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={playCompare}
          activeOpacity={0.7}
          style={{
            padding: 12,
            borderRadius: 12,
            backgroundColor: playback === 'compare' ? '#EF4444' : '#F59E0B',
            alignItems: 'center',
          }}>
          <AppText variant="body" weight="bold" style={{color: '#FFF'}}>
            {playback === 'compare' ? '⏹️ Dừng' : '▶️ Phát so sánh'}
          </AppText>
        </TouchableOpacity>
      </View>

      {/* Word-level IPA Comparison (MỚI: refactored format) */}
      {improvements.length > 0 && (
        <View style={{
          padding: 14,
          borderRadius: 14,
          backgroundColor: colors.surface,
        }}>
          <AppText variant="body" weight="semibold" style={{marginBottom: 10}}>
            📖 Chi tiết phát âm từng từ
          </AppText>
          <View style={{gap: 8}}>
            {improvements.map((imp, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 10,
                  backgroundColor: colors.background,
                  gap: 10,
                }}>
                {/* Phoneme */}
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: '#EF444415',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <AppText variant="body" weight="bold" style={{color: '#EF4444'}}>
                    {imp.phoneme}
                  </AppText>
                </View>

                {/* Before → After */}
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', gap: 4}}>
                    <AppText variant="caption" style={{color: '#EF4444', textDecorationLine: 'line-through'}}>
                      {imp.before}
                    </AppText>
                    <AppText variant="caption" style={{color: colors.neutrals400}}>→</AppText>
                    <AppText variant="caption" weight="bold" style={{color: '#22C55E'}}>
                      {imp.after}
                    </AppText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ============================================
// AudioCard — Card phát audio với waveform
// ============================================

interface AudioCardProps {
  title: string;
  isPlaying: boolean;
  onPress: () => void;
  accentColor: string;
  surfaceColor: string;
  rightContent?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Mục đích: Card chung cho playback audio (user / AI)
 * Tham số đầu vào: title, isPlaying, onPress, accentColor, children (waveform)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: VoiceCloneReplay → card "Bản gốc" và "AI đã sửa"
 */
function AudioCard({title, isPlaying, onPress, accentColor, surfaceColor, rightContent, children}: AudioCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        padding: 14,
        borderRadius: 14,
        backgroundColor: surfaceColor,
        borderWidth: isPlaying ? 1.5 : 0,
        borderColor: accentColor,
      }}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
        <AppText variant="body" weight="semibold">
          {title}
        </AppText>
        {rightContent}
      </View>

      {children}

      {/* Play/Pause indicator */}
      <View style={{alignItems: 'center', marginTop: 8}}>
        <AppText variant="caption" style={{color: accentColor}}>
          {isPlaying ? '⏸️ Đang phát — nhấn để dừng' : '▶️ Nhấn để phát'}
        </AppText>
      </View>
    </TouchableOpacity>
  );
}
