import React, {useEffect, useRef, useState} from 'react';
import {View, ScrollView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {SKILL_COLORS} from '@/config/skillColors';
import Icon from '@/components/ui/Icon';
import {
  PhonemeHeatmap,
  ScoreBreakdown,
  ConfettiAnimation,
} from '@/components/speaking';
import VoiceCloneReplay from '@/components/speaking/VoiceCloneReplay';
import type {VoiceImprovement} from '@/components/speaking/VoiceCloneReplay';
import {speakingApi} from '@/services/api/speaking';

// =======================
// Constants
// =======================

const speakingColor = SKILL_COLORS.speaking.dark;

/**
 * Mục đích: Lấy emoji + label cho score range
 * Tham số đầu vào: score (number) — điểm 0-100
 * Tham số đầu ra: { emoji, label, color }
 * Khi nào sử dụng: Hiển thị đánh giá tổng bên dưới score
 */
function getScoreInfo(score: number) {
  if (score >= 90) return {emoji: '🎉', label: 'Xuất sắc!', color: '#22c55e'};
  if (score >= 75) return {emoji: '👏', label: 'Tốt lắm!', color: '#4ade80'};
  if (score >= 60) return {emoji: '💪', label: 'Khá ổn!', color: '#facc15'};
  if (score >= 40) return {emoji: '📖', label: 'Cần cải thiện', color: '#f59e0b'};
  return {emoji: '🔄', label: 'Cố gắng thêm nhé!', color: '#ef4444'};
}

/**
 * Mục đích: Lấy màu cho điểm từng từ
 * Tham số đầu vào: score (number) — điểm 0-100
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Hiển thị word score badge
 */
function getWordColor(score: number) {
  if (score >= 85) return '#22c55e'; // xanh lá
  if (score >= 60) return '#f59e0b'; // vàng cam
  return '#ef4444'; // đỏ
}

/**
 * Mục đích: Hiển thị kết quả AI đánh giá phát âm
 * Tham số đầu vào: không có (đọc từ store)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   PracticeScreen → ghi âm → transcribe → evaluate → navigate Feedback
 *   User xem kết quả → "Luyện lại" hoặc "Tiếp theo"
 */
export default function FeedbackScreen() {
  const navigation = useNavigation<any>();
  const {
    feedback,
    sentences,
    currentIndex,
    nextSentence,
    clearRecording,
  } = useSpeakingStore();

  // Animated score counter
  const animValue = useRef(new Animated.Value(0)).current;
  const [displayScore, setDisplayScore] = React.useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Voice Clone state
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneResult, setCloneResult] = useState<{
    correctedAudioUrl: string;
    improvements: VoiceImprovement[];
  } | null>(null);

  useEffect(() => {
    if (!feedback) return;

    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: feedback.overallScore,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    const listener = animValue.addListener(({value}) => {
      setDisplayScore(Math.round(value));
    });

    // Confetti khi điểm >= 80
    if (feedback.overallScore >= 80) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }

    return () => animValue.removeListener(listener);
  }, [feedback, animValue]);

  /**
   * Mục đích: Gọi AI Voice Clone khi màn hình mở
   * Khi nào sử dụng: FeedbackScreen mount + có feedback + audioUri
   */
  useEffect(() => {
    const audioUri = useSpeakingStore.getState().audioUri;
    const text = sentences[currentIndex]?.text;
    if (!feedback || !audioUri || !text) return;

    setCloneLoading(true);
    speakingApi.cloneAndCorrectVoice(audioUri, text)
      .then(result => {
        setCloneResult(result);
        console.log('✅ [VoiceClone] Đã nhận bản sửa từ AI');
      })
      .catch(err => {
        console.warn('⚠️ [VoiceClone] Không lấy được bản sửa:', err);
      })
      .finally(() => setCloneLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!feedback) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" raw>
          Không có kết quả. Vui lòng thử lại.
        </AppText>
        <AppButton variant="outline" className="mt-4" onPress={() => navigation.goBack()}>
          Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  const scoreInfo = getScoreInfo(feedback.overallScore);
  const isLastSentence = currentIndex >= sentences.length - 1;

  /**
   * Mục đích: Quay lại PracticeScreen để luyện lại cùng câu
   * Khi nào sử dụng: User muốn retry
   */
  const handleRetry = () => {
    clearRecording();
    navigation.goBack();
  };

  /**
   * Mục đích: Chuyển sang câu tiếp theo
   * Khi nào sử dụng: User đạt điểm ổn, muốn tiếp tục
   */
  const handleNext = () => {
    nextSentence();
    clearRecording();
    navigation.goBack();
  };

  /**
   * Mục đích: Kết thúc session, quay về đầu stack
   * Khi nào sử dụng: User đã luyện hết hoặc muốn dừng
   */
  const handleFinish = () => {
    navigation.popToTop();
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Confetti Animation */}
      <ConfettiAnimation visible={showConfetti} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost"
          size="icon"
          onPress={handleRetry}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="heading3" weight="bold">
            Kết quả
          </AppText>
        </View>
        <AppButton
          variant="ghost"
          size="icon"
          onPress={handleFinish}
          icon={<Icon name="X" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 24}}
      >
        {/* Score Card */}
        <View className="items-center mx-4 py-8 rounded-3xl mb-6"
          style={{backgroundColor: `${scoreInfo.color}10`}}>
          <AppText variant="bodySmall" className="text-neutrals400 mb-2" raw>
            🎯 Điểm phát âm
          </AppText>
          <AppText
            variant="heading1"
            weight="bold"
            style={{color: scoreInfo.color, fontSize: 56}}
            raw
          >
            {displayScore}
          </AppText>
          <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
            / 100
          </AppText>
          <AppText variant="body" weight="semibold" className="mt-2" raw>
            {scoreInfo.emoji} {scoreInfo.label}
          </AppText>
        </View>

        {/* Score Breakdown (thay thế sub-scores cũ) */}
        <ScoreBreakdown
          scores={[
            {label: 'Phát âm', value: feedback.pronunciation, icon: '🎯'},
            {label: 'Trôi chảy', value: feedback.fluency, icon: '💬'},
            {label: 'Tốc độ', value: feedback.pace, icon: '⚡'},
          ]}
        />

        {/* Phoneme Heatmap (thay thế word-by-word cũ) */}
        {feedback.wordByWord.length > 0 && (
          <PhonemeHeatmap words={feedback.wordByWord} />
        )}

        {/* Tips */}
        {feedback.feedback.tips.length > 0 && (
          <View className="mx-4 mb-6 p-4 rounded-2xl" style={{backgroundColor: `${speakingColor}10`}}>
            <AppText variant="body" weight="semibold" className="mb-2 text-foreground" raw>
              💡 Gợi ý cải thiện
            </AppText>
            {feedback.feedback.tips.map((tip, i) => (
              <View key={i} className="flex-row mt-2">
                <AppText variant="bodySmall" className="text-foreground mr-2" raw>
                  •
                </AppText>
                <AppText variant="bodySmall" className="flex-1 text-foreground" raw>
                  {tip}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* Encouragement */}
        {feedback.feedback.encouragement && (
          <View className="mx-4 mb-6 p-4 rounded-2xl bg-neutrals100">
            <AppText variant="body" className="text-center text-foreground" raw>
              {feedback.feedback.encouragement}
            </AppText>
          </View>
        )}

        {/* Câu gốc recap */}
        <View className="mx-4 mb-4 p-4 rounded-2xl bg-neutrals100">
          <AppText variant="bodySmall" weight="semibold" className="text-neutrals400 mb-1" raw>
            Câu đã luyện
          </AppText>
          <AppText variant="body" className="text-foreground" raw>
            {sentences[currentIndex]?.text}
          </AppText>
        </View>

        {/* AI Voice Clone Replay */}
        {(cloneLoading || cloneResult) && (
          <View className="mx-4 mb-4">
            <VoiceCloneReplay
              userAudioUrl={useSpeakingStore.getState().audioUri || ''}
              correctedAudioUrl={cloneResult?.correctedAudioUrl || ''}
              improvements={cloneResult?.improvements || []}
              isLoading={cloneLoading}
            />
          </View>
        )}
      </ScrollView>

      {/* Actions */}
      <View className="flex-row gap-3 px-4 pb-4">
        <AppButton
          variant="outline"
          size="lg"
          className="flex-1"
          onPress={handleRetry}
        >
          🔁 Luyện lại
        </AppButton>
        {isLastSentence ? (
          <AppButton
            variant="primary"
            size="lg"
            className="flex-1"
            style={{backgroundColor: speakingColor}}
            onPress={handleFinish}
          >
            ✅ Hoàn thành
          </AppButton>
        ) : (
          <AppButton
            variant="primary"
            size="lg"
            className="flex-1"
            style={{backgroundColor: speakingColor}}
            onPress={handleNext}
          >
            ➡️ Câu tiếp
          </AppButton>
        )}
      </View>
    </SafeAreaView>
  );
}
