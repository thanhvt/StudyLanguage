import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  FlatList,
  Pressable,
  Animated,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {SKILL_COLORS} from '@/config/skillColors';
import {speakingApi} from '@/services/api/speaking';
import TurnCounter from '@/components/speaking/TurnCounter';
import {VoiceVisualizer, CountdownOverlay} from '@/components/speaking';

// Optional modules
let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule = require('react-native-audio-recorder-player').default;
} catch {
  console.warn('⚠️ [Roleplay] react-native-audio-recorder-player chưa install');
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [Roleplay] react-native-fs chưa install');
}

const speakingColor = SKILL_COLORS.speaking.dark;
const audioRecorderPlayer = AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null;

// =======================
// Types
// =======================

type RoleplayTurn = {
  id: string;
  speaker: 'ai' | 'user';
  text: string;
  timestamp: number;
};

/**
 * Mục đích: Màn hình phiên Roleplay — AI và User luân phiên nói
 * Tham số đầu vào: route params: title, totalTurns, emoji
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng:
 *   RoleplaySelectScreen → navigate RoleplaySession
 *   Flow: AI nói → User ghi âm → AI phản hồi → ... → kết thúc
 */
export default function RoleplaySessionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const colors = useColors();

  const {title = 'Roleplay', totalTurns = 6, emoji = '🎭'} = route.params || {};

  // State
  const [turns, setTurns] = useState<RoleplayTurn[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isAITalking, setIsAITalking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // AI đối thoại đầu tiên
  useEffect(() => {
    generateAITurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pulse animation
  useEffect(() => {
    if (isRecording) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {toValue: 1.15, duration: 500, useNativeDriver: true}),
          Animated.timing(pulseAnim, {toValue: 1, duration: 500, useNativeDriver: true}),
        ]),
      );
      loop.start();
      return () => loop.stop();
    }
    pulseAnim.setValue(1);
  }, [isRecording, pulseAnim]);

  /**
   * Mục đích: Tạo lời nói AI cho roleplay
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: Mở đầu phiên + sau mỗi lượt user
   */
  const generateAITurn = useCallback(async () => {
    try {
      setIsAITalking(true);
      const history = turns.map(t => ({speaker: t.speaker, text: t.text}));

      const response = await speakingApi.continueConversation(
        history,
        '',
        title,
      );

      const aiTurn: RoleplayTurn = {
        id: `ai-${Date.now()}`,
        speaker: 'ai',
        text: response.response,
        timestamp: Date.now(),
      };

      setTurns(prev => [...prev, aiTurn]);
      setCurrentTurn(prev => prev + 1);

      // Phát audio AI
      try {
        const audioBase64 = await speakingApi.generateCoachAudio(response.response);
        const path = `${RNFSModule?.CachesDirectoryPath || '/tmp'}/roleplay_ai.mp3`;
        await RNFSModule?.writeFile(path, audioBase64, 'base64');
        await audioRecorderPlayer?.startPlayer(path);
        audioRecorderPlayer?.addPlayBackListener((e: any) => {
          if (e.currentPosition >= e.duration) {
            audioRecorderPlayer?.stopPlayer();
            audioRecorderPlayer?.removePlayBackListener();
            setIsAITalking(false);
          }
        });
      } catch {
        setIsAITalking(false);
      }

      console.log('🤖 [Roleplay] AI nói:', response.response.substring(0, 50));

      if (response.shouldEnd || currentTurn >= totalTurns - 1) {
        setIsComplete(true);
      }
    } catch (err) {
      console.error('❌ [Roleplay] Lỗi tạo AI turn:', err);
      setIsAITalking(false);
    }
  }, [turns, title, currentTurn, totalTurns]);

  /**
   * Mục đích: Bắt đầu countdown → ghi âm user
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn mic sau lượt AI
   */
  const handleStartRecord = useCallback(() => {
    setShowCountdown(true);
  }, []);

  const handleCountdownDone = useCallback(async () => {
    setShowCountdown(false);
    setIsRecording(true);
    setRecordDuration(0);

    try {
      const path = Platform.select({
        ios: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/roleplay_user.m4a`,
        android: `${RNFSModule?.CachesDirectoryPath || '/tmp'}/roleplay_user.mp4`,
      })!;
      await audioRecorderPlayer?.startRecorder(path);

      let secs = 0;
      timerRef.current = setInterval(() => {
        secs += 1;
        setRecordDuration(secs);
        if (secs >= 20) handleStopRecord();
      }, 1000);
    } catch (err) {
      console.error('❌ [Roleplay] Lỗi ghi âm:', err);
      setIsRecording(false);
    }
  }, []);

  /**
   * Mục đích: Dừng ghi âm → transcribe → thêm turn user → AI tiếp
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn stop
   */
  const handleStopRecord = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      const uri = (await audioRecorderPlayer?.stopRecorder()) || '';
      setIsRecording(false);
      setIsProcessing(true);

      // Transcribe
      const transcript = await speakingApi.transcribeAudio(uri);
      console.log('🗣️ [Roleplay] User nói:', transcript.substring(0, 50));

      const userTurn: RoleplayTurn = {
        id: `user-${Date.now()}`,
        speaker: 'user',
        text: transcript || '(Không nghe rõ)',
        timestamp: Date.now(),
      };

      setTurns(prev => [...prev, userTurn]);
      setCurrentTurn(prev => prev + 1);
      setIsProcessing(false);

      // AI phản hồi tiếp
      if (currentTurn < totalTurns - 1) {
        setTimeout(() => generateAITurn(), 500);
      } else {
        setIsComplete(true);
      }
    } catch (err) {
      console.error('❌ [Roleplay] Lỗi xử lý:', err);
      setIsRecording(false);
      setIsProcessing(false);
    }
  }, [currentTurn, totalTurns, generateAITurn]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  /**
   * Mục đích: Render 1 turn (AI hoặc User)
   * Tham số đầu vào: item (RoleplayTurn)
   * Tham số đầu ra: JSX.Element
   * Khi nào sử dụng: FlatList renderItem
   */
  const renderTurn = ({item}: {item: RoleplayTurn}) => {
    const isAI = item.speaker === 'ai';
    return (
      <View
        style={{
          alignSelf: isAI ? 'flex-start' : 'flex-end',
          maxWidth: '80%',
          padding: 12,
          borderRadius: 16,
          marginBottom: 8,
          backgroundColor: isAI ? colors.surface : `${speakingColor}20`,
          borderBottomLeftRadius: isAI ? 4 : 16,
          borderBottomRightRadius: isAI ? 16 : 4,
        }}>
        <AppText variant="caption" weight="semibold" style={{color: isAI ? '#60A5FA' : speakingColor}} raw>
          {isAI ? '🤖 AI' : '🗣️ Bạn'}
        </AppText>
        <AppText variant="body" className="text-foreground mt-1" raw>
          {item.text}
        </AppText>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Countdown */}
      <CountdownOverlay visible={showCountdown} from={3} onComplete={handleCountdownDone} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3">
        <AppButton
          variant="ghost" size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}>
          {''}
        </AppButton>
        <View className="flex-1 items-center">
          <AppText variant="body" weight="bold" raw>
            {emoji} {title}
          </AppText>
        </View>
        <TurnCounter current={currentTurn} total={totalTurns} label="Lượt" />
      </View>

      {/* Chat */}
      <FlatList
        ref={flatListRef}
        data={turns}
        renderItem={renderTurn}
        keyExtractor={item => item.id}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8}}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({animated: true})}
        ListEmptyComponent={
          <View className="items-center py-20">
            <ActivityIndicator size="large" color={speakingColor} />
            <AppText variant="bodySmall" className="text-neutrals400 mt-4" raw>
              Đang chuẩn bị kịch bản...
            </AppText>
          </View>
        }
      />

      {/* Bottom controls */}
      <View className="items-center pb-6 px-4">
        {/* AI đang nói */}
        {isAITalking && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color="#60A5FA" />
            <AppText variant="bodySmall" className="ml-2 text-neutrals400" raw>
              🤖 AI đang nói...
            </AppText>
          </View>
        )}

        {/* Processing */}
        {isProcessing && (
          <View className="flex-row items-center mb-4">
            <ActivityIndicator size="small" color={speakingColor} />
            <AppText variant="bodySmall" className="ml-2 text-neutrals400" raw>
              Đang xử lý...
            </AppText>
          </View>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <View className="mb-4 items-center">
            <VoiceVisualizer isRecording height={35} color={speakingColor} />
            <AppText variant="heading3" weight="bold" className="text-foreground mt-1" raw>
              {formatTime(recordDuration)}
            </AppText>
          </View>
        )}

        {/* Hoàn thành */}
        {isComplete ? (
          <AppButton
            variant="primary" size="lg"
            style={{backgroundColor: speakingColor, width: '100%'}}
            onPress={() => navigation.popToTop()}>
            ✅ Hoàn thành Roleplay
          </AppButton>
        ) : (
          /* Nút mic */
          !isAITalking && !isProcessing && (
            <Animated.View style={{transform: [{scale: pulseAnim}]}}>
              <Pressable
                onPress={isRecording ? handleStopRecord : handleStartRecord}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 36,
                  backgroundColor: isRecording ? '#ef4444' : speakingColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: isRecording ? '#ef4444' : speakingColor,
                  shadowOffset: {width: 0, height: 4},
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}>
                <Icon
                  name={isRecording ? 'Square' : 'Mic'}
                  className="w-7 h-7 text-white"
                />
              </Pressable>
            </Animated.View>
          )
        )}
      </View>
    </SafeAreaView>
  );
}
