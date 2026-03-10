import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, ScrollView, Animated, Platform, Pressable, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import {useSpeakingStore} from '@/store/useSpeakingStore';
import {useSkillColor} from '@/hooks/useSkillColor';
import Icon from '@/components/ui/Icon';
import ScoreRing from '@/components/speaking/ScoreRing';
import {
  PhonemeHeatmap,
  ConfettiAnimation,
} from '@/components/speaking';
import {speakingApi} from '@/services/api/speaking';
import {saveSpeakingSession} from '@/services/speaking/saveSpeakingSession';
import type {PracticeSessionData} from '@/services/speaking/saveSpeakingSession';
import TrackPlayer from 'react-native-track-player';
import {setupPlayer} from '@/services/audio/trackPlayer';
import {useColors} from '@/hooks/useColors';

// RNFS cho file path
let RNFSModule: any;
try {
  RNFSModule = require('react-native-fs');
} catch {
  // Bỏ qua
}

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
 * Mục đích: Hiển thị kết quả AI đánh giá phát âm — redesign v2
 * Tham số đầu vào: không có (đọc từ store)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   PracticeScreen → ghi âm → transcribe → evaluate → navigate Feedback
 *   User xem kết quả → "Luyện lại" hoặc "Tiếp theo"
 */
export default function FeedbackScreen() {
  const navigation = useNavigation<any>();
  const speakingColor = useSkillColor('speaking');
  const colors = useColors();
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
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingAI, setIsPlayingAI] = useState(false);
  const [cloneLoading, setCloneLoading] = useState(false);
  const [cloneAudioUrl, setCloneAudioUrl] = useState('');

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

  // TrackPlayer: auto-reset play state khi audio kết thúc
  useEffect(() => {
    const sub = TrackPlayer.addEventListener('playback-queue-ended' as any, () => {
      setIsPlayingUser(false);
      setIsPlayingAI(false);
    });
    return () => sub.remove();
  }, []);

  /**
   * Mục đích: Phát âm chuẩn của 1 từ khi user chạm vào trong PhonemeHeatmap
   * Tham số đầu vào: word (string) — từ cần phát âm
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap vào ô từ → gọi OpenAI TTS → phát qua TrackPlayer
   */
  const handleWordTap = useCallback(async (word: string) => {
    try {
      console.log('🔊 [Feedback] Phát âm từ:', word);
      const base64Audio = await speakingApi.playAISample(word, 'openai', undefined, 0.85);
      if (!base64Audio) return;

      const filePath = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/word_tts_${Date.now()}.mp3`;
      await RNFSModule?.writeFile(filePath, base64Audio, 'base64');

      await setupPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `word-${word}-${Date.now()}`,
        url: Platform.OS === 'ios' ? filePath : `file://${filePath}`,
        title: word,
      });
      await TrackPlayer.play();
    } catch (err) {
      console.warn('⚠️ [Feedback] Lỗi phát âm từ:', word, err);
    }
  }, []);

  /**
   * Mục đích: Phát lại bản ghi của user
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Bản gốc" trong Voice Clone section
   */
  const handlePlayUser = useCallback(async () => {
    if (!audioUri) return;
    try {
      if (isPlayingUser) {
        await TrackPlayer.pause();
        setIsPlayingUser(false);
        return;
      }
      setIsPlayingAI(false);
      setIsPlayingUser(true);
      await setupPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `user-${Date.now()}`,
        url: Platform.OS === 'ios' ? audioUri : `file://${audioUri}`,
        title: 'Bản gốc của bạn',
      });
      await TrackPlayer.play();
    } catch (err) {
      console.warn('⚠️ [Feedback] Lỗi phát bản user:', err);
      setIsPlayingUser(false);
    }
  }, [audioUri, isPlayingUser]);

  /**
   * Mục đích: Gọi AI Voice Clone + phát audio sửa
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "AI sửa" — lazy load clone
   */
  const handlePlayAI = useCallback(async () => {
    const text = sentences[currentIndex]?.text;
    if (!audioUri || !text) return;

    try {
      if (isPlayingAI && cloneAudioUrl) {
        await TrackPlayer.pause();
        setIsPlayingAI(false);
        return;
      }

      setIsPlayingUser(false);
      setIsPlayingAI(true);

      // Nếu chưa có clone audio → gọi API
      let url = cloneAudioUrl;
      if (!url) {
        setCloneLoading(true);
        try {
          const result = await speakingApi.cloneAndCorrectVoice(audioUri, text);
          url = result.correctedAudioUrl;
          setCloneAudioUrl(url);
        } catch (err) {
          console.warn('⚠️ [VoiceClone] Không lấy được bản sửa:', err);
          setIsPlayingAI(false);
          setCloneLoading(false);
          return;
        }
        setCloneLoading(false);
      }

      await setupPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add({
        id: `ai-clone-${Date.now()}`,
        url,
        title: 'AI đã sửa phát âm',
      });
      await TrackPlayer.play();
    } catch (err) {
      console.warn('⚠️ [Feedback] Lỗi phát AI clone:', err);
      setIsPlayingAI(false);
    }
  }, [audioUri, isPlayingAI, cloneAudioUrl, sentences, currentIndex]);

  if (!feedback) {
    return (
      <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
          <AppText variant="body" raw>
            Không có kết quả. Vui lòng thử lại.
          </AppText>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.outlineBtn, {borderColor: colors.neutrals600, marginTop: 16}]}>
            <AppText style={{fontSize: 14, fontWeight: '600', color: colors.foreground}}>Quay lại</AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isLastSentence = currentIndex >= sentences.length - 1;

  /**
   * Mục đích: Quay lại PracticeScreen để luyện lại cùng câu
   * Khi nào sử dụng: User nhấn "Nói lại"
   */
  const handleRetry = () => {
    clearRecording();
    navigation.goBack();
  };

  /**
   * Mục đích: Chuyển sang câu tiếp theo
   * Khi nào sử dụng: User nhấn "Câu tiếp theo"
   */
  const handleNext = () => {
    nextSentence();
    clearRecording();
    navigation.goBack();
  };

  /**
   * Mục đích: Chia sẻ kết quả dưới dạng ảnh
   * Khi nào sử dụng: User nhấn Share
   */
  const handleShare = async () => {
    try {
      if (!ViewShot?.captureRef || !viewShotRef.current) return;
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
      const durationSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const topicText = sentences.length > 0
        ? sentences[0].text.slice(0, 50)
        : 'Practice Mode';
      const sessionData: PracticeSessionData = {
        topic: topicText,
        sentences: sentences.map(s => ({text: s.text, ipa: s.ipa})),
        scores: scoresRef.current,
        durationSeconds,
        audioUri: audioUri || undefined,
      };
      saveSpeakingSession('practice', sessionData);
    }
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      {/* Confetti Animation */}
      <ConfettiAnimation visible={showConfetti} />

      {/* Header — ← back + "Kết quả" */}
      <View style={styles.header}>
        <Pressable onPress={handleRetry} hitSlop={8} style={styles.headerBtn}>
          <Icon name="ArrowLeft" className="w-5 h-5" style={{color: colors.foreground}} />
        </Pressable>
        <AppText style={{fontSize: 18, fontWeight: '700', color: colors.foreground}}>
          Kết quả
        </AppText>
        <View style={{width: 36}} />
      </View>

      <ScrollView
        style={{flex: 1}}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingBottom: 24}}
      >
        {/* Score Card — ScoreRing + Grade badge + Câu x/y */}
        <View ref={viewShotRef} collapsable={false}>
          <View style={styles.scoreCard}>
            <ScoreRing
              value={displayScore}
              size={140}
              strokeWidth={8}
              showGradeBadge={true}
            />

            {/* Câu thứ mấy / tổng */}
            <AppText style={{fontSize: 13, color: colors.neutrals400, marginTop: 8}} raw>
              Câu {currentIndex + 1}/{sentences.length}
            </AppText>
          </View>
        </View>

        {/* Phân tích từng từ — v2 design */}
        {feedback.wordByWord.length > 0 && (
          <PhonemeHeatmap words={feedback.wordByWord} onWordTap={handleWordTap} />
        )}

        {/* AI Tips — v2 design card */}
        {feedback.feedback.tips.length > 0 && (
          <View style={[styles.tipsCard, {backgroundColor: colors.surface}]}>
            <AppText style={{fontSize: 15, fontWeight: '600', color: colors.foreground, marginBottom: 8}} raw>
              💡 AI Tips
            </AppText>
            {feedback.feedback.tips.map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <AppText style={{fontSize: 13, color: colors.neutrals400, marginRight: 6}} raw>
                  💡
                </AppText>
                <AppText style={{fontSize: 13, color: colors.foreground, flex: 1}} raw>
                  {tip}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {/* AI Voice Clone — 2 nút ngang: Bản gốc | AI sửa */}
        <View style={[styles.voiceCloneCard, {backgroundColor: colors.surface}]}>
          <View style={styles.voiceCloneHeader}>
            <AppText style={{fontSize: 15, fontWeight: '600', color: colors.foreground}} raw>
              AI Voice Clone
            </AppText>
            <Pressable onPress={handleShare} hitSlop={8}>
              <AppText style={{fontSize: 13, color: speakingColor}} raw>
                Share
              </AppText>
            </Pressable>
          </View>

          {/* 2 nút cạnh nhau */}
          <View style={styles.voiceCloneRow}>
            {/* Bản gốc */}
            <Pressable
              onPress={handlePlayUser}
              style={[styles.voiceBtn, {borderColor: colors.neutrals600}]}>
              <Icon
                name={isPlayingUser ? 'Pause' : 'Mic'}
                className="w-4 h-4"
                style={{color: colors.foreground}}
              />
              <AppText style={{fontSize: 13, fontWeight: '600', color: colors.foreground, marginLeft: 6}}>
                Bản gốc
              </AppText>
            </Pressable>

            {/* AI sửa */}
            <Pressable
              onPress={handlePlayAI}
              disabled={cloneLoading}
              style={[styles.voiceBtn, {borderColor: colors.neutrals600, opacity: cloneLoading ? 0.5 : 1}]}>
              <Icon
                name={isPlayingAI ? 'Pause' : 'Bot'}
                className="w-4 h-4"
                style={{color: colors.foreground}}
              />
              <AppText style={{fontSize: 13, fontWeight: '600', color: colors.foreground, marginLeft: 6}}>
                {cloneLoading ? 'Đang tải...' : 'AI sửa'}
              </AppText>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Footer — manual Pressable buttons (v2 design) */}
      <View style={styles.footer}>
        {/* Nói lại */}
        <Pressable
          onPress={handleRetry}
          style={[styles.footerBtn, {borderWidth: 1, borderColor: colors.neutrals600}]}>
          <Icon name="RefreshCw" className="w-4 h-4" style={{color: colors.foreground}} />
          <AppText style={{fontSize: 14, fontWeight: '600', color: colors.foreground, marginLeft: 6}}>
            Nói lại
          </AppText>
        </Pressable>

        {/* Câu tiếp theo / Hoàn thành */}
        <Pressable
          onPress={isLastSentence ? handleFinish : handleNext}
          style={[styles.footerBtn, {backgroundColor: speakingColor, flex: 1.5}]}>
          <Icon
            name={isLastSentence ? 'CheckCircle' : 'ArrowRight'}
            className="w-4 h-4"
            style={{color: '#fff'}}
          />
          <AppText style={{fontSize: 14, fontWeight: '600', color: '#fff', marginLeft: 6}}>
            {isLastSentence ? 'Hoàn thành' : 'Câu tiếp theo'}
          </AppText>
        </Pressable>

        {/* Share */}
        <Pressable
          onPress={handleShare}
          style={[styles.shareBtn, {borderWidth: 1, borderColor: colors.neutrals600}]}>
          <Icon name="Share2" className="w-5 h-5" style={{color: colors.foreground}} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// =======================
// Styles
// =======================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  tipsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  tipRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  voiceCloneCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 16,
  },
  voiceCloneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  voiceCloneRow: {
    flexDirection: 'row',
    gap: 10,
  },
  voiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  footerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 14,
  },
  outlineBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  shareBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
