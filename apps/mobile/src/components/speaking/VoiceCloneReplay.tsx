import React, {useState, useCallback} from 'react';
import {View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {AppText} from '@/components/ui';
import {useColors} from '@/hooks/useColors';
import {useHaptic} from '@/hooks/useHaptic';
import {WaveformComparison} from '@/components/speaking';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

// ============================================
// TYPES
// ============================================

interface VoiceCloneReplayProps {
  /** URL audio bản ghi gốc của user */
  userAudioUrl: string;
  /** URL audio đã được AI sửa */
  correctedAudioUrl: string;
  /** Danh sách cải thiện cụ thể */
  improvements: VoiceImprovement[];
  /** Đang loading (chờ AI xử lý) */
  isLoading?: boolean;
}

/** Chi tiết 1 điểm cải thiện từ AI Voice Clone */
export interface VoiceImprovement {
  /** Âm vị cần sửa */
  phoneme: string;
  /** Cách user phát âm */
  before: string;
  /** Cách phát âm chuẩn */
  after: string;
}

// ============================================
// AUDIO PLAYER INSTANCE
// ============================================

const audioPlayer = new AudioRecorderPlayer();

// ============================================
// MAIN COMPONENT
// ============================================

/**
 * Mục đích: Component hiển thị before/after audio replay cho AI Voice Clone
 *           So sánh bản ghi gốc của user vs bản được AI sửa
 * Tham số đầu vào: VoiceCloneReplayProps (userAudioUrl, correctedAudioUrl, improvements)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: FeedbackScreen → sau khi có feedback → hiển thị section "AI Voice Clone"
 */
export default function VoiceCloneReplay({
  userAudioUrl,
  correctedAudioUrl,
  improvements,
  isLoading = false,
}: VoiceCloneReplayProps) {
  const colors = useColors();
  const haptic = useHaptic();

  // Đang phát track nào: 'user' | 'ai' | null
  const [playing, setPlaying] = useState<'user' | 'ai' | null>(null);

  /**
   * Mục đích: Phát audio (user recording hoặc AI corrected)
   * Tham số đầu vào: type ('user' | 'ai'), url (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn nút Play trên 1 trong 2 card
   */
  const handlePlay = useCallback(async (type: 'user' | 'ai', url: string) => {
    haptic.light();

    // Đang phát cùng track → dừng
    if (playing === type) {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
      setPlaying(null);
      return;
    }

    // Dừng track cũ (nếu có)
    if (playing) {
      await audioPlayer.stopPlayer();
      audioPlayer.removePlayBackListener();
    }

    try {
      setPlaying(type);
      await audioPlayer.startPlayer(url);
      audioPlayer.addPlayBackListener((e) => {
        if (e.currentPosition >= e.duration) {
          setPlaying(null);
          audioPlayer.stopPlayer();
          audioPlayer.removePlayBackListener();
        }
      });
    } catch (err) {
      console.error('❌ [VoiceClone] Lỗi phát audio:', err);
      setPlaying(null);
    }
  }, [playing, haptic]);

  // Loading skeleton
  if (isLoading) {
    return (
      <View
        style={{
          padding: 16,
          borderRadius: 16,
          backgroundColor: colors.surface,
          alignItems: 'center',
          gap: 8,
        }}>
        <ActivityIndicator size="small" color="#A855F7" />
        <AppText variant="caption" style={{color: colors.neutrals400}}>
          🎭 Đang phân tích giọng nói...
        </AppText>
      </View>
    );
  }

  return (
    <View style={{gap: 12}}>
      {/* Tiêu đề */}
      <AppText variant="body" weight="bold">
        🎭 AI Voice Clone
      </AppText>
      <AppText variant="caption" style={{color: colors.neutrals400}}>
        So sánh bản ghi của bạn với phiên bản AI đã sửa
      </AppText>

      {/* Before / After Cards */}
      <View style={{flexDirection: 'row', gap: 10}}>
        {/* Your Recording */}
        <AudioCard
          label="🎤 Bản gốc"
          sublabel="Your Recording"
          isPlaying={playing === 'user'}
          onPress={() => handlePlay('user', userAudioUrl)}
          accentColor="#EF4444"
          bgColor={colors.surface}
        />

        {/* AI Corrected */}
        <AudioCard
          label="🤖 AI đã sửa"
          sublabel="Corrected Version"
          isPlaying={playing === 'ai'}
          onPress={() => handlePlay('ai', correctedAudioUrl)}
          accentColor="#A855F7"
          bgColor={colors.surface}
        />
      </View>

      {/* Waveform Comparison — hiển thị visual khác biệt */}
      <WaveformComparison
        aiWaveform={Array.from({length: 30}, () => Math.random() * 0.3 + 0.5)}
        userWaveform={Array.from({length: 30}, () => Math.random() * 0.4 + 0.3)}
      />

      {/* Improvements List */}
      {improvements.length > 0 && (
        <View style={{gap: 6}}>
          <AppText variant="caption" weight="bold" style={{color: '#A855F7'}}>
            📝 Chi tiết cải thiện
          </AppText>
          {improvements.map((item, index) => (
            <View
              key={`imp-${index}`}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 6,
                paddingHorizontal: 10,
                borderRadius: 8,
                backgroundColor: `${colors.surface}`,
              }}>
              {/* Âm vị */}
              <View
                style={{
                  backgroundColor: '#A855F720',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}>
                <AppText variant="caption" weight="bold" style={{color: '#A855F7'}}>
                  {item.phoneme}
                </AppText>
              </View>

              {/* Before → After */}
              <AppText variant="caption" style={{color: '#EF4444'}}>
                {item.before}
              </AppText>
              <AppText variant="caption" style={{color: colors.neutrals400}}>
                →
              </AppText>
              <AppText variant="caption" style={{color: '#22C55E'}}>
                {item.after}
              </AppText>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ============================================
// AudioCard — Nút play cho 1 track
// ============================================

interface AudioCardProps {
  label: string;
  sublabel: string;
  isPlaying: boolean;
  onPress: () => void;
  accentColor: string;
  bgColor: string;
}

/**
 * Mục đích: Card nhỏ có nút play/stop cho 1 audio track
 * Tham số đầu vào: label, isPlaying, onPress, accentColor
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: VoiceCloneReplay → 2 cards "Bản gốc" và "AI đã sửa"
 */
function AudioCard({label, sublabel, isPlaying, onPress, accentColor, bgColor}: AudioCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: isPlaying ? accentColor : 'transparent',
        backgroundColor: isPlaying ? `${accentColor}10` : bgColor,
        alignItems: 'center',
        gap: 6,
      }}>
      {/* Play/Stop icon */}
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: accentColor,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <AppText variant="body" style={{color: '#FFF', fontSize: 18}}>
          {isPlaying ? '⏹' : '▶️'}
        </AppText>
      </View>

      {/* Label */}
      <AppText variant="caption" weight="bold">
        {label}
      </AppText>
      <AppText variant="caption" style={{color: '#9CA3AF', fontSize: 10}}>
        {sublabel}
      </AppText>
    </TouchableOpacity>
  );
}
