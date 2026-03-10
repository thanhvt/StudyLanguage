import {useState, useRef, useCallback} from 'react';
import {speakingApi} from '@/services/api/speaking';

// =======================
// Types
// =======================

interface AudioRecorderState {
  /** Đang ghi âm? */
  isRecording: boolean;
  /** Thời lượng ghi (seconds) */
  duration: number;
  /** URI file audio trên device */
  audioUri: string | null;
  /** Waveform data (amplitude 0-1) */
  waveform: number[];
}

interface AudioRecorderActions {
  /** Bắt đầu ghi âm */
  startRecording: () => Promise<void>;
  /** Dừng ghi âm và trả về URI + transcript */
  stopRecording: () => Promise<{audioUri: string; transcript: string} | null>;
  /** Hủy ghi âm */
  cancelRecording: () => void;
}

// =======================
// Hook
// =======================

/**
 * Mục đích: Hook quản lý audio recording + transcription cho AI Conversation
 * Tham số đầu vào: không
 * Tham số đầu ra: {state, actions} — recording state + control actions
 * Khi nào sử dụng:
 *   ConversationScreen → user nhấn mic → startRecording → stopRecording → transcript
 *   Dùng kết hợp với RecordingOverlay component
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
   * Mục đích: Bắt đầu ghi âm
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn giữ mic button
   */
  const startRecording = useCallback(async () => {
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

    // Fake waveform data (TODO: thay bằng real audio metering)
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
   * Khi nào sử dụng: User thả mic button hoặc nhấn stop
   */
  const stopRecording = useCallback(async (): Promise<{audioUri: string; transcript: string} | null> => {
    console.log('🎤 [AudioRecorder] Dừng ghi âm...');

    // Dọn timers
    if (durationTimer.current) clearInterval(durationTimer.current);
    if (waveformTimer.current) clearInterval(waveformTimer.current);

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
  }, []);

  /**
   * Mục đích: Hủy ghi âm (user kéo trái trên RecordingOverlay)
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: RecordingOverlay → onCancel
   */
  const cancelRecording = useCallback(() => {
    console.log('🎤 [AudioRecorder] Hủy ghi âm');

    if (durationTimer.current) clearInterval(durationTimer.current);
    if (waveformTimer.current) clearInterval(waveformTimer.current);

    setState({
      isRecording: false,
      duration: 0,
      audioUri: null,
      waveform: [],
    });
  }, []);

  return [
    state,
    {startRecording, stopRecording, cancelRecording},
  ];
}
