import React, {useEffect, useRef, useState} from 'react';
import {View, ScrollView, Animated} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useSkillColor} from '@/hooks/useSkillColor';
import Icon from '@/components/ui/Icon';
import ScoreRing from '@/components/speaking/ScoreRing';
import {
  PhonemeHeatmap,
  ScoreBreakdown,
  ConfettiAnimation,
} from '@/components/speaking';
import VoiceCloneReplay from '@/components/speaking/VoiceCloneReplay';
import type {VoiceImprovement} from '@/components/speaking/VoiceCloneReplay';
import {speakingApi} from '@/services/api/speaking';
import {saveSpeakingSession} from '@/services/speaking/saveSpeakingSession';
import type {PracticeSessionData} from '@/services/speaking/saveSpeakingSession';

// Share utils
let ViewShot: any;
let ShareModule: any;
try {
  ViewShot = require('react-native-view-shot');
} catch {
  console.warn('⚠️ [Feedback] react-native-view-shot chưa install');
}
try {
  ShareModule = require('react-native-share').default;
} catch {
  console.warn('⚠️ [Feedback] react-native-share chưa install');
}



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
 * Mục đích: Lấy màu cho điểm từng từ (NAV-NF04: green ≥ 80%, yellow 60-79%, red <60%)
 * Tham số đầu vào: score (number) — điểm 0-100
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: Hiển thị word score badge
 */
export function getWordColor(score: number) {
  if (score >= 80) return '#22c55e'; // xanh lá (≥ 80%)
  if (score >= 60) return '#f59e0b'; // vàng cam (60-79%)
  return '#ef4444'; // đỏ (< 60%)
}

/**
 * Mục đích: Lấy màu cho grade badge
 * Tham số đầu vào: grade (string)
 * Tham số đầu ra: string — hex color
 * Khi nào sử dụng: FeedbackScreen → Grade badge
 */
function getGradeColor(grade: string): string {
  if (grade.startsWith('A')) return '#22c55e';
  if (grade.startsWith('B')) return '#3B82F6';
  if (grade.startsWith('C')) return '#f59e0b';
  if (grade === 'D') return '#F97316';
  return '#ef4444'; // F
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
  const speakingColor = useSkillColor('speaking');
  const {
    feedback,
    sentences,
    currentIndex,
    audioUri,
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

  // Tránh lưu trùng lặp
  const savedRef = useRef(false);
  // BUG-H01 FIX: Tích luỹ scores qua các câu
  const scoresRef = useRef<{sentenceIndex: number; overallScore: number; grade?: string; wordScores?: any[]}[]>([]);
  // BUG-H04 FIX: Track thời gian session
  const sessionStartRef = useRef(Date.now());

  // Share ref
  const viewShotRef = useRef<any>(null);

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

    // Confetti khi điểm >= 90 (NAV-NF05 spec)
    if (feedback.overallScore >= 90) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }

    return () => animValue.removeListener(listener);
  }, [feedback, animValue]);

  // BUG-H01 FIX: Tích lũy score mỗi lần FeedbackScreen mount (mỗi câu)
  useEffect(() => {
    if (!feedback) return;
    scoresRef.current.push({
      sentenceIndex: currentIndex,
      overallScore: feedback.overallScore,
      grade: feedback.grade,
      wordScores: feedback.wordByWord?.map(w => ({
        word: w.word,
        score: w.score,
        ipa: w.phonemes,
      })),
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Mục đích: Gọi AI Voice Clone khi màn hình mở
   * Khi nào sử dụng: FeedbackScreen mount + có feedback + audioUri
   */
  useEffect(() => {
    const currentAudioUri = audioUri;
    const text = sentences[currentIndex]?.text;
    if (!feedback || !currentAudioUri || !text) return;

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
   * Mục đích: Chia sẻ kết quả dưới dạng ảnh (PRC-16)
   * Khi nào sử dụng: User nhấn nút Share
   */
  const handleShare = async () => {
    try {
      if (!ViewShot?.captureRef || !viewShotRef.current) {
        console.warn('⚠️ [Feedback] ViewShot chưa sẵn sàng');
        return;
      }
      const uri = await ViewShot.captureRef(viewShotRef.current, {
        format: 'png',
        quality: 0.9,
      });
      if (ShareModule) {
        await ShareModule.open({
          url: `file://${uri}`,
          type: 'image/png',
          title: `Điểm phát âm: ${feedback.overallScore}/100`,
        });
      }
    } catch (err: any) {
      if (err?.message !== 'User did not share') {
        console.error('❌ [Feedback] Lỗi share:', err);
      }
    }
  };

  const handleFinish = () => {
    // PRC-15: Auto-save vào history (fire-and-forget)
    if (!savedRef.current && scoresRef.current.length > 0) {
      savedRef.current = true;
      // BUG-H04 FIX: Tính duration thực tế
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      // BUG-H05 FIX: Lấy topic từ câu đầu tiên thay vì hardcode
      const topicText = sentences.length > 0
        ? sentences[0].text.slice(0, 50)
        : 'Practice Mode';
      const sessionData: PracticeSessionData = {
        topic: topicText,
        sentences: sentences.map(s => ({text: s.text, ipa: s.ipa})),
        // BUG-H01 FIX: Lưu tất cả scores tích luỹ, không chỉ câu cuối
        scores: scoresRef.current,
        durationSeconds,
        audioUri: audioUri || undefined,
      };
      saveSpeakingSession('practice', sessionData);
    }
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
        {/* Score Card — SVG Ring (B9 fix) */}
        <View ref={viewShotRef} collapsable={false}>
          <View className="items-center mx-4 py-8 rounded-3xl mb-6"
            style={{backgroundColor: `${scoreInfo.color}10`}}>
            <AppText variant="bodySmall" className="text-neutrals400 mb-4" raw>
              🎯 Điểm phát âm
            </AppText>

            {/* ScoreRing SVG */}
            <ScoreRing
              value={displayScore}
              size={140}
              strokeWidth={8}
              showGrade={false}
            />

            {/* Grade Badge */}
            {feedback.grade && (
              <View
                style={{
                  marginTop: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 6,
                  borderRadius: 12,
                  backgroundColor: `${getGradeColor(feedback.grade)}20`,
                }}>
                <AppText
                  variant="heading3"
                  weight="bold"
                  style={{color: getGradeColor(feedback.grade)}}
                  raw>
                  {feedback.grade}
                </AppText>
              </View>
            )}

            <AppText variant="body" weight="semibold" className="mt-2" raw>
              {scoreInfo.emoji} {scoreInfo.label}
            </AppText>

            {/* Câu thứ mấy / tổng */}
            <AppText variant="caption" className="text-neutrals400 mt-1" raw>
              Câu {currentIndex + 1}/{sentences.length}
            </AppText>
          </View>
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
              sentence={sentences[currentIndex]?.text ?? ''}
              score={feedback.overallScore}
              userAudioUri={audioUri || ''}
              correctedAudioUrl={cloneResult?.correctedAudioUrl || ''}
              improvements={cloneResult?.improvements || []}
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

        {/* Share button (PRC-16) */}
        <AppButton
          variant="ghost"
          size="icon"
          onPress={handleShare}
          icon={<Icon name="Share2" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
      </View>
    </SafeAreaView>
  );
}
