'use client';

import { useState, useRef, useCallback } from 'react';
import { showError } from '@/lib/toast';

/**
 * Interface định nghĩa trạng thái của audio recorder
 */
export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
}

/**
 * Interface định nghĩa return type của hook
 */
export interface UseAudioRecorderReturn {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  resetRecording: () => void;
}

/**
 * useAudioRecorder - Hook quản lý ghi âm từ microphone
 * 
 * Mục đích: Sử dụng MediaRecorder API để ghi âm audio từ browser
 * Tham số đầu vào: Không có
 * Tham số đầu ra: Object chứa state và các methods để điều khiển ghi âm
 * Khi nào sử dụng: Trong Speaking page để ghi âm giọng nói của user
 * 
 * Luồng sử dụng:
 *   1. Gọi startRecording() để bắt đầu ghi âm
 *   2. Gọi stopRecording() để dừng và lấy Blob audio
 *   3. Gọi resetRecording() để xóa audio đã ghi và ghi mới
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  // State lưu trữ trạng thái ghi âm
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  // error state removed in favor of toast
  const [duration, setDuration] = useState(0);

  // Refs để lưu trữ các objects không cần re-render
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Bắt đầu ghi âm từ microphone
   * 
   * Mục đích: Request quyền micro và bắt đầu MediaRecorder
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Khi user nhấn nút Record
   */
  const startRecording = useCallback(async () => {
    try {
      // Reset state trước khi ghi mới
      setAudioBlob(null);
      audioChunksRef.current = [];

      // Request quyền truy cập microphone
      console.log('[useAudioRecorder] Đang yêu cầu quyền microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Whisper hoạt động tốt với 16kHz
        } 
      });

      // Xác định MIME type được hỗ trợ
      // Whisper hỗ trợ: flac, m4a, mp3, mp4, mpeg, mpga, oga, ogg, wav, webm
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = 'audio/mp4';
          }
        }
      }
      console.log('[useAudioRecorder] Sử dụng MIME type:', mimeType);

      // Khởi tạo MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      // Lắng nghe event khi có data
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('[useAudioRecorder] Nhận chunk audio:', event.data.size, 'bytes');
        }
      };

      // Lắng nghe event khi dừng ghi
      mediaRecorder.onstop = () => {
        console.log('[useAudioRecorder] MediaRecorder đã dừng');
        // Dừng tất cả tracks để giải phóng microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Dừng timer đếm thời gian
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      // Lắng nghe event lỗi
      mediaRecorder.onerror = (event) => {
        console.error('[useAudioRecorder] Lỗi MediaRecorder:', event);
        showError('Lỗi khi ghi âm');
      };

      // Bắt đầu ghi với timeslice 500ms để nhận data thường xuyên
      mediaRecorder.start(500);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Bắt đầu timer đếm thời gian
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      console.log('[useAudioRecorder] Bắt đầu ghi âm thành công');
    } catch (err) {
      console.error('[useAudioRecorder] Lỗi khi bắt đầu ghi âm:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          showError('Vui lòng cấp quyền sử dụng microphone');
        } else if (err.name === 'NotFoundError') {
          showError('Không tìm thấy microphone');
        } else {
          showError(`Lỗi: ${err.message}`);
        }
      } else {
        showError('Không thể bắt đầu ghi âm');
      }
    }
  }, []);

  /**
   * Dừng ghi âm và trả về Blob audio
   * 
   * Mục đích: Dừng MediaRecorder và tạo Blob từ các chunks đã ghi
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<Blob | null> - Blob audio hoặc null nếu lỗi
   * Khi nào sử dụng: Khi user nhấn nút Stop
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      
      if (!mediaRecorder || mediaRecorder.state === 'inactive') {
        console.warn('[useAudioRecorder] MediaRecorder không hoạt động');
        setIsRecording(false);
        resolve(null);
        return;
      }

      // Lắng nghe event stop để tạo blob
      const handleStop = () => {
        console.log('[useAudioRecorder] Đang tạo blob từ', audioChunksRef.current.length, 'chunks');
        
        if (audioChunksRef.current.length === 0) {
          console.warn('[useAudioRecorder] Không có audio data');
          setIsRecording(false);
          resolve(null);
          return;
        }

        // Tạo blob từ các chunks
        const blob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        console.log('[useAudioRecorder] Đã tạo blob:', blob.size, 'bytes, type:', blob.type);
        setAudioBlob(blob);
        setIsRecording(false);
        resolve(blob);
      };

      // Thêm listener một lần
      mediaRecorder.addEventListener('stop', handleStop, { once: true });
      
      // Dừng ghi
      mediaRecorder.stop();
    });
  }, []);

  /**
   * Reset trạng thái ghi âm
   * 
   * Mục đích: Xóa audio đã ghi để chuẩn bị ghi mới
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Không có
   * Khi nào sử dụng: Khi cần clear audio và ghi lại
   */
  const resetRecording = useCallback(() => {
    setAudioBlob(null);
    setAudioBlob(null);
    // setError(null);
    setDuration(0);
    audioChunksRef.current = [];
    console.log('[useAudioRecorder] Đã reset trạng thái');
  }, []);

  return {
    isRecording,
    audioBlob,
    duration,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
