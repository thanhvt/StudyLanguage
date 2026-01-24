'use client';

import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export interface AudioRecorderState {
  isRecording: boolean;
  audioBlob: Blob | null;
  duration: number;
}

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
 * Sử dụng MediaRecorder API để ghi âm audio từ browser.
 * Hỗ trợ các MIME types: webm, ogg, mp4
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Bắt đầu ghi âm từ microphone
   */
  const startRecording = useCallback(async () => {
    try {
      setAudioBlob(null);
      audioChunksRef.current = [];

      console.log('[useAudioRecorder] Đang yêu cầu quyền microphone...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        } 
      });

      // Xác định MIME type được hỗ trợ
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

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log('[useAudioRecorder] Nhận chunk audio:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('[useAudioRecorder] MediaRecorder đã dừng');
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[useAudioRecorder] Lỗi MediaRecorder:', event);
        toast.error('Lỗi khi ghi âm');
      };

      // Bắt đầu ghi với timeslice 500ms
      mediaRecorder.start(500);
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Timer đếm thời gian
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      console.log('[useAudioRecorder] Bắt đầu ghi âm thành công');
    } catch (err) {
      console.error('[useAudioRecorder] Lỗi khi bắt đầu ghi âm:', err);
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          toast.error('Vui lòng cấp quyền sử dụng microphone');
        } else if (err.name === 'NotFoundError') {
          toast.error('Không tìm thấy microphone');
        } else {
          toast.error(`Lỗi: ${err.message}`);
        }
      } else {
        toast.error('Không thể bắt đầu ghi âm');
      }
    }
  }, []);

  /**
   * Dừng ghi âm và trả về Blob audio
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

      const handleStop = () => {
        console.log('[useAudioRecorder] Đang tạo blob từ', audioChunksRef.current.length, 'chunks');
        
        if (audioChunksRef.current.length === 0) {
          console.warn('[useAudioRecorder] Không có audio data');
          setIsRecording(false);
          resolve(null);
          return;
        }

        const blob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType 
        });
        
        console.log('[useAudioRecorder] Đã tạo blob:', blob.size, 'bytes, type:', blob.type);
        setAudioBlob(blob);
        setIsRecording(false);
        resolve(blob);
      };

      mediaRecorder.addEventListener('stop', handleStop, { once: true });
      mediaRecorder.stop();
    });
  }, []);

  /**
   * Reset trạng thái ghi âm
   */
  const resetRecording = useCallback(() => {
    setAudioBlob(null);
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
