import {useCallback, useEffect, useRef, useState} from 'react';
import {Platform} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import {useShadowingStore} from '@/store/useShadowingStore';

// =======================
// Constants
// =======================

/** Đường dẫn lưu file recording */
const RECORDING_PATH = Platform.select({
  ios: 'shadowing_recording.m4a',
  android: 'sdcard/shadowing_recording.m4a',
}) as string;

// =======================
// Hook
// =======================

/**
 * Mục đích: Quản lý ghi âm user cho Shadowing Mode
 *   Ghi âm giọng user khi đang shadow AI + feed amplitude cho waveform
 * Tham số đầu vào: không có
 * Tham số đầu ra: { startRecording, stopRecording, isRecording, audioUri, currentAmplitude }
 * Khi nào sử dụng:
 *   - ShadowingSessionScreen Phase 2 (Shadow):
 *     + AI bắt đầu phát → setTimeout(delayMs) → startRecording()
 *     + AI kết thúc → stopRecording() → return audioUri
 *   - ShadowingFeedbackScreen: "Nghe bạn" → phát lại audioUri
 */
export function useShadowingRecorder() {
  const recorderRef = useRef<AudioRecorderPlayer>(new AudioRecorderPlayer());
  const [isRecording, setIsRecording] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [currentAmplitude, setCurrentAmplitude] = useState(0);

  // Store actions
  const setStoreRecording = useShadowingStore(s => s.setRecording);
  const appendUserWaveform = useShadowingStore(s => s.appendUserWaveform);

  // Fix M1: Cleanup on unmount — tránh memory leak waveform listener
  useEffect(() => {
    const recorder = recorderRef.current;
    return () => {
      try {
        recorder.removeRecordBackListener();
        recorder.stopRecorder().catch(() => {});
        recorder.stopPlayer().catch(() => {});
        console.log('🧹 [ShadowingRec] Cleanup recorder khi unmount');
      } catch {
        // Bỏ qua lỗi cleanup
      }
    };
  }, []);

  /**
   * Mục đích: Bắt đầu ghi âm giọng user
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng:
   *   - Phase 2 (Shadow): sau delay → startRecording()
   *   - Phải gọi sau khi TrackPlayer đã play AI audio (dual stream)
   */
  const startRecording = useCallback(async () => {
    try {
      const recorder = recorderRef.current;

      // Cấu hình recording
      const uri = await recorder.startRecorder(RECORDING_PATH, {
        AudioEncoderAndroid: 3, // AAC
        AudioSourceAndroid: 6, // VOICE_RECOGNITION (có AEC trên Android)
        AVEncoderAudioQualityKeyIOS: 127, // max quality
        AVNumberOfChannelsKeyIOS: 1, // Mono cho voice
        AVSampleRateKeyIOS: 44100,
      });

      setIsRecording(true);
      setStoreRecording(true);
      setAudioUri(uri);
      console.log('🎤 [ShadowingRec] Bắt đầu ghi âm:', uri);

      // Lắng nghe amplitude để feed waveform
      recorder.addRecordBackListener(e => {
        // e.currentMetering: dB level (-160 đến 0)
        // Chuẩn hoá về 0-1 cho waveform
        const db = e.currentMetering ?? -60;
        const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
        setCurrentAmplitude(normalized);
        appendUserWaveform(normalized);
      });
    } catch (err) {
      console.error('❌ [ShadowingRec] Lỗi bắt đầu ghi âm:', err);
      setIsRecording(false);
      setStoreRecording(false);
    }
  }, [setStoreRecording, appendUserWaveform]);

  /**
   * Mục đích: Dừng ghi âm và trả về URI file audio
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<string | null> — đường dẫn file audio, null nếu lỗi
   * Khi nào sử dụng:
   *   - Phase 2: AI kết thúc → stopRecording() → gửi audio lên server đánh giá
   *   - User nhấn "Dừng & Chấm điểm"
   */
  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      const recorder = recorderRef.current;
      const uri = await recorder.stopRecorder();
      recorder.removeRecordBackListener();

      setIsRecording(false);
      setStoreRecording(false);
      setCurrentAmplitude(0);
      setAudioUri(uri);

      console.log('⏹️ [ShadowingRec] Dừng ghi âm:', uri);
      return uri;
    } catch (err) {
      console.error('❌ [ShadowingRec] Lỗi dừng ghi âm:', err);
      setIsRecording(false);
      setStoreRecording(false);
      return null;
    }
  }, [setStoreRecording]);

  /**
   * Mục đích: Phát lại audio user đã ghi
   * Tham số đầu vào: uri (string, optional) — dùng audioUri cuối cùng nếu không truyền
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: FeedbackScreen → "Nghe bạn" button
   */
  const playbackRecording = useCallback(
    async (uri?: string) => {
      try {
        const recorder = recorderRef.current;
        const playUri = uri ?? audioUri;
        if (!playUri) {
          console.warn('⚠️ [ShadowingRec] Không có audio để phát lại');
          return;
        }
        await recorder.startPlayer(playUri);
        console.log('▶️ [ShadowingRec] Đang phát lại recording');
      } catch (err) {
        console.error('❌ [ShadowingRec] Lỗi phát lại:', err);
      }
    },
    [audioUri],
  );

  /**
   * Mục đích: Dừng phát lại
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn dừng khi đang nghe playback
   */
  const stopPlayback = useCallback(async () => {
    try {
      const recorder = recorderRef.current;
      await recorder.stopPlayer();
      console.log('⏹️ [ShadowingRec] Dừng phát lại');
    } catch (err) {
      console.error('❌ [ShadowingRec] Lỗi dừng phát lại:', err);
    }
  }, []);

  return {
    startRecording,
    stopRecording,
    playbackRecording,
    stopPlayback,
    isRecording,
    audioUri,
    currentAmplitude,
  };
}
