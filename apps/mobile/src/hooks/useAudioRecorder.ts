import {useState, useRef, useCallback, useEffect} from 'react';
import {Platform, Alert, Linking} from 'react-native';
import {speakingApi} from '@/services/api/speaking';

// =======================
// Optional module loading
// =======================

let AudioRecorderPlayerModule: any;
let RNFSModule: any;
try {
  AudioRecorderPlayerModule =
    require('react-native-audio-recorder-player').default;
} catch {
  console.warn(
    '⚠️ [AudioRecorder] react-native-audio-recorder-player chưa install',
  );
}
try {
  RNFSModule = require('react-native-fs');
} catch {
  console.warn('⚠️ [AudioRecorder] react-native-fs chưa install');
}

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
// Constants
// =======================

/** Đường dẫn saving file ghi âm */
const RECORDING_PATH = Platform.select({
  ios: 'conversation_recording.m4a',
  android: 'sdcard/conversation_recording.m4a',
}) as string;

/** Số điểm waveform tối đa hiển thị */
const MAX_WAVEFORM_POINTS = 30;

// =======================
// Permission Helper
// =======================

/**
 * Mục đích: Hiện alert xin permission khi user từ chối mic
 * Tham số đầu vào: không
 * Tham số đầu ra: void
 * Khi nào sử dụng: Khi recording fail với permission error
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
 *   Sử dụng react-native-audio-recorder-player (giống ShadowingRecorder)
 *   với real metering data cho waveform visualization
 * Tham số đầu vào: không
 * Tham số đầu ra: [AudioRecorderState, AudioRecorderActions]
 * Khi nào sử dụng:
 *   ConversationScreen → user nhấn mic (tap) → startRecording
 *   → nhấn lần nữa hoặc vuốt xuống → stopRecording → transcript → sendMessage(transcript)
 *   → vuốt lên hoặc vuốt trái → cancelRecording
 *   Dùng kết hợp với <RecordingOverlay> component
 */
export function useAudioRecorder(): [AudioRecorderState, AudioRecorderActions] {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    duration: 0,
    audioUri: null,
    waveform: [],
  });

  const recorderRef = useRef<any>(
    AudioRecorderPlayerModule ? new AudioRecorderPlayerModule() : null,
  );
  const durationTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Mục đích: Cleanup tất cả timers + listeners khi unmount
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: useEffect cleanup
   */
  useEffect(() => {
    return () => {
      if (durationTimer.current) {
        clearInterval(durationTimer.current);
      }
      try {
        recorderRef.current?.removeRecordBackListener();
        recorderRef.current?.stopRecorder().catch(() => {});
      } catch {
        // Bỏ qua lỗi cleanup
      }
      console.log('🧹 [AudioRecorder] Cleanup khi unmount');
    };
  }, []);

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
  }, []);

  /**
   * Mục đích: Bắt đầu ghi âm — sử dụng react-native-audio-recorder-player thật
   *   Cấu hình AEC (Echo Cancellation) cho iOS voiceChat mode
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn mic button để bắt đầu ghi (tap-to-toggle)
   */
  const startRecording = useCallback(async () => {
    const recorder = recorderRef.current;

    // Nếu thư viện chưa install → fallback simulated
    if (!recorder) {
      console.warn(
        '⚠️ [AudioRecorder] Thư viện chưa install, dùng simulated recording',
      );
      startSimulatedRecording();
      return;
    }

    console.log('🎤 [AudioRecorder] Bắt đầu ghi âm thật...');

    setState({
      isRecording: true,
      duration: 0,
      audioUri: null,
      waveform: [],
    });

    try {
      // Bắt đầu ghi âm với config tương tự ShadowingRecorder
      // iOS: voiceChat mode bật AEC tự động
      // Android: VOICE_RECOGNITION (source 6) có AEC built-in
      await recorder.startRecorder(RECORDING_PATH, {
        AudioEncoderAndroid: 3, // AAC
        AudioSourceAndroid: 6, // VOICE_RECOGNITION (có AEC)
        AVEncoderAudioQualityKeyIOS: 127, // max quality
        AVNumberOfChannelsKeyIOS: 1, // Mono
        AVSampleRateKeyIOS: 44100,
      });

      // Duration counter
      durationTimer.current = setInterval(() => {
        setState(prev => ({...prev, duration: prev.duration + 1}));
      }, 1000);

      // Lắng nghe amplitude metering thật → waveform
      recorder.addRecordBackListener((e: any) => {
        // e.currentMetering: dB level (-160 đến 0)
        // Chuẩn hoá về 0-1 cho waveform giống useShadowingRecorder
        const db = e.currentMetering ?? -60;
        const normalized = Math.max(0, Math.min(1, (db + 60) / 60));

        setState(prev => ({
          ...prev,
          waveform: [
            ...prev.waveform.slice(-(MAX_WAVEFORM_POINTS - 1)),
            normalized,
          ],
        }));
      });
    } catch (err: any) {
      console.error('❌ [AudioRecorder] Lỗi ghi âm:', err);

      setState(prev => ({...prev, isRecording: false}));

      // EC-02: Permission denied → hướng dẫn Settings
      if (
        err?.message?.includes('permission') ||
        err?.code === 'E_AUDIO_NOPERMISSION'
      ) {
        showPermissionDeniedAlert();
      }
    }
  }, []);

  /**
   * Mục đích: Fallback simulated recording khi thư viện chưa install (dev mode)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: startRecording khi AudioRecorderPlayer chưa install
   */
  const startSimulatedRecording = useCallback(() => {
    setState({
      isRecording: true,
      duration: 0,
      audioUri: null,
      waveform: [],
    });

    // Duration
    durationTimer.current = setInterval(() => {
      setState(prev => ({...prev, duration: prev.duration + 1}));
    }, 1000);
  }, []);

  /**
   * Mục đích: Dừng ghi âm, transcribe bằng Groq Whisper, trả về kết quả
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<{audioUri, transcript} | null>
   * Khi nào sử dụng: User nhấn mic lần nữa hoặc vuốt xuống trên RecordingOverlay
   */
  const stopRecording = useCallback(async (): Promise<{
    audioUri: string;
    transcript: string;
  } | null> => {
    console.log('🎤 [AudioRecorder] Dừng ghi âm...');
    cleanupTimers();

    const recorder = recorderRef.current;
    let audioUri: string;

    if (recorder) {
      try {
        // Dừng recorder thật → lấy URI file audio
        audioUri = (await recorder.stopRecorder()) || '';
        recorder.removeRecordBackListener();
      } catch (err) {
        console.error('❌ [AudioRecorder] Lỗi stop recorder:', err);
        setState(prev => ({...prev, isRecording: false}));
        return null;
      }
    } else {
      // Fallback khi không có thư viện
      audioUri = '/tmp/simulated_recording.m4a';
    }

    setState(prev => ({
      ...prev,
      isRecording: false,
      audioUri,
    }));

    // Guard: recording quá ngắn (< 1s)
    if (state.duration < 1) {
      console.warn('⚠️ [AudioRecorder] Recording quá ngắn, bỏ qua');
      return null;
    }

    // Transcribe bằng Groq Whisper
    try {
      console.log('🔤 [AudioRecorder] Đang transcribe...', audioUri);
      const transcript = await speakingApi.transcribeAudio(audioUri);
      console.log(
        '✅ [AudioRecorder] Transcript:',
        transcript?.substring(0, 50),
      );

      return {
        audioUri,
        transcript: transcript || '',
      };
    } catch (err) {
      console.error('❌ [AudioRecorder] Lỗi transcribe:', err);
      return null;
    }
  }, [cleanupTimers, state.duration]);

  /**
   * Mục đích: Hủy ghi âm (user swipe cancel trên RecordingOverlay)
   *   Dừng recording, xóa file, reset state
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: RecordingOverlay → onCancel
   */
  const cancelRecording = useCallback(() => {
    console.log('🎤 [AudioRecorder] Hủy ghi âm');
    cleanupTimers();

    const recorder = recorderRef.current;

    if (recorder) {
      try {
        recorder.stopRecorder().catch(() => {});
        recorder.removeRecordBackListener();
      } catch {
        // Bỏ qua lỗi
      }
    }

    // Xóa file recording nếu có thể
    if (RNFSModule && RECORDING_PATH) {
      const fullPath = `${RNFSModule.CachesDirectoryPath || ''}/${RECORDING_PATH}`;
      RNFSModule.unlink(fullPath).catch(() => {});
    }

    setState({
      isRecording: false,
      duration: 0,
      audioUri: null,
      waveform: [],
    });
  }, [cleanupTimers]);

  return [state, {startRecording, stopRecording, cancelRecording}];
}
