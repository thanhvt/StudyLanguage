import {useState, useRef, useCallback} from 'react';
import {Platform, Alert, Linking} from 'react-native';
import {speakingApi} from '@/services/api/speaking';

// =======================
// Types
// =======================

export interface AudioRecorderState {
  /** Đang ghi âm? */
  isRecording: boolean;
  /** Thời lượng ghi (seconds) */
  duration: number;
  /** URI file audio trên device */
  audioUri: string | null;
  /** Waveform data (amplitude 0-1) cho RecordingOverlay */
  waveform: number[];
}

export interface AudioRecorderActions {
  /** Bắt đầu ghi âm — check permission trước */
  startRecording: () => Promise<void>;
  /** Dừng ghi âm và trả về URI + transcript */
  stopRecording: () => Promise<{audioUri: string; transcript: string} | null>;
  /** Hủy ghi âm (swipe cancel) */
  cancelRecording: () => void;
}

// =======================
// Permission Helper
// =======================

/**
 * Mục đích: Check + request microphone permission (EC-02)
 * Tham số đầu vào: không
 * Tham số đầu ra: Promise<boolean> — true nếu có permission
 * Khi nào sử dụng: Trước mỗi lần startRecording
 */
async function checkMicPermission(): Promise<boolean> {
  try {
    // TODO: Khi có expo-av hoặc react-native-permissions:
    // const { status } = await Audio.requestPermissionsAsync();
    // return status === 'granted';

    // Tạm thời: luôn trả true cho development
    // Production sẽ cần real permission check
    console.log('🎤 [Permission] Checking mic permission...');
    return true;
  } catch {
    console.error('❌ [Permission] Lỗi check mic permission');
    return false;
  }
}

/**
 * Mục đích: Hiện alert xin permission khi user từ chối
 * Tham số đầu vào: không
 * Tham số đầu ra: void
 * Khi nào sử dụng: Khi checkMicPermission() return false
 */
function showPermissionDeniedAlert(): void {
  Alert.alert(
    'Cần quyền microphone',
    'Ứng dụng cần quyền truy cập microphone để ghi âm giọng nói. Vui lòng bật trong Cài đặt.',
    [
      {text: 'Để sau', style: 'cancel'},
      {
        text: 'Mở Cài đặt',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ],
  );
}

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook quản lý audio recording + transcription cho AI Conversation
 * Tham số đầu vào: không
 * Tham số đầu ra: [AudioRecorderState, AudioRecorderActions]
 * Khi nào sử dụng:
 *   ConversationScreen → user nhấn giữ mic → startRecording
 *   → thả → stopRecording → transcript → sendMessage(transcript)
 *   → kéo cancel → cancelRecording
 *   Dùng kết hợp với <RecordingOverlay> component
 */
export function useAudioRecorder(): [AudioRecorderState, AudioRecorderActions] {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    duration: 0,
    audioUri: null,
    waveform: [],
  });

  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveformTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Mục đích: Dọn dẹp tất cả timers
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: stop/cancel recording
   */
  const cleanupTimers = useCallback(() => {
    if (durationTimer.current) {
      clearInterval(durationTimer.current);
      durationTimer.current = null;
    }
    if (waveformTimer.current) {
      clearInterval(waveformTimer.current);
      waveformTimer.current = null;
    }
  }, []);

  /**
   * Mục đích: Bắt đầu ghi âm — check permission trước (EC-02)
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn giữ mic button (onLongPress)
   */
  const startRecording = useCallback(async () => {
    // EC-02: Check mic permission
    const hasPermission = await checkMicPermission();
    if (!hasPermission) {
      showPermissionDeniedAlert();
      return;
    }

    console.log('🎤 [AudioRecorder] Bắt đầu ghi âm...');

    setState({
      isRecording: true,
      duration: 0,
      audioUri: null,
      waveform: [],
    });

    // Duration counter
    durationTimer.current = setInterval(() => {
      setState(prev => ({...prev, duration: prev.duration + 1}));
    }, 1000);

    // Simulated waveform data
    // TODO: Thay bằng real audio metering từ expo-av
    waveformTimer.current = setInterval(() => {
      setState(prev => ({
        ...prev,
        waveform: [...prev.waveform.slice(-29), Math.random() * 0.8 + 0.1],
      }));
    }, 100);

    // TODO: Integrate với expo-av hoặc react-native-audio-api
    // const recording = new Audio.Recording();
    // await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    // await recording.startAsync();
  }, []);

  /**
   * Mục đích: Dừng ghi âm, transcribe, trả về kết quả
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<{audioUri, transcript} | null>
   * Khi nào sử dụng: User thả mic button (onPressOut)
   */
  const stopRecording = useCallback(async (): Promise<{audioUri: string; transcript: string} | null> => {
    console.log('🎤 [AudioRecorder] Dừng ghi âm...');
    cleanupTimers();

    // TODO: Stop actual recording + get URI
    const audioUri = '/tmp/recording.m4a'; // Placeholder

    setState(prev => ({
      ...prev,
      isRecording: false,
      audioUri,
    }));

    // Transcribe
    try {
      console.log('🔤 [AudioRecorder] Đang transcribe...');
      const transcript = await speakingApi.transcribeAudio(audioUri);
      console.log('✅ [AudioRecorder] Transcript:', transcript?.substring(0, 50));

      return {
        audioUri,
        transcript: transcript || '',
      };
    } catch (err) {
      console.error('❌ [AudioRecorder] Lỗi transcribe:', err);
      return null;
    }
  }, [cleanupTimers]);

  /**
   * Mục đích: Hủy ghi âm (user swipe cancel trên RecordingOverlay)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: RecordingOverlay → onCancel
   */
  const cancelRecording = useCallback(() => {
    console.log('🎤 [AudioRecorder] Hủy ghi âm');
    cleanupTimers();

    // TODO: Stop và delete actual recording file
    setState({
      isRecording: false,
      duration: 0,
      audioUri: null,
      waveform: [],
    });
  }, [cleanupTimers]);

  return [
    state,
    {startRecording, stopRecording, cancelRecording},
  ];
}
