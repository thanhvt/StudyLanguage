'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { showError } from '@/lib/toast';

interface ScriptLine {
  speaker: string;
  text: string;
  isUserTurn: boolean;
}

interface InteractiveListeningProps {
  topic: string;
  onBack: () => void;
  duration?: number;
  autoPlay?: boolean;
  handsOnlyMode?: boolean;
}

/**
 * InteractiveListening Component
 *
 * Mục đích: Cho phép user tham gia vào hội thoại với AI
 * Flow:
 *   1. AI sinh script với YOUR TURN markers
 *   2. AI đọc từng phần
 *   3. Dừng lại ở YOUR TURN để user nói
 *   4. AI phản hồi dựa trên user input
 */
export function InteractiveListening({ 
  topic, 
  onBack,
  duration = 5,
  autoPlay: initialAutoPlay = false,
  handsOnlyMode: initialHandsOnlyMode = false
}: InteractiveListeningProps) {
  // Script state
  const [scenario, setScenario] = useState<string | null>(null);
  const [script, setScript] = useState<ScriptLine[] | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [conversationHistory, setConversationHistory] = useState<{ speaker: string; text: string }[]>([]);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Settings state (inline controls)
  const [autoPlay, setAutoPlay] = useState(initialAutoPlay);
  const [handsOnlyMode, setHandsOnlyMode] = useState(initialHandsOnlyMode);

  // Audio refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasInitialized = useRef(false);

  /**
   * Sinh hội thoại tương tác từ AI
   */
  const generateScript = useCallback(async () => {
    setIsGenerating(true);

    try {
      // Sử dụng API client có xác thực
      const response = await api('/ai/generate-interactive-conversation', {
        method: 'POST',
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) throw new Error('Lỗi sinh hội thoại');

      const data = await response.json();
      setScenario(data.scenario);
      setScript(data.script);
      setCurrentIndex(0);
      setConversationHistory([]);
      setIsComplete(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Lỗi tạo hội thoại');
    } finally {
      setIsGenerating(false);
    }
  }, [topic]);

  /**
   * Auto-generate on mount (Improvement #2: loại bỏ double confirmation)
   */
  useEffect(() => {
    if (!hasInitialized.current && topic) {
      hasInitialized.current = true;
      generateScript();
    }
  }, [generateScript, topic]);

  /**
   * AI đọc câu hiện tại bằng TTS
   */
  const speakCurrentLine = useCallback(async () => {
    if (!script || currentIndex >= script.length) return;

    const line = script[currentIndex];
    if (line.isUserTurn) return; // Không đọc phần của user

    setIsAiSpeaking(true);

    try {
      const response = await api('/ai/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({
          text: line.text,
          voice: 'nova',
        }),
      });

      if (!response.ok) throw new Error('Lỗi TTS');

      const data = await response.json();
      const audioDataUrl = `data:audio/mpeg;base64,${data.audio}`;

      // Phát audio
      if (audioRef.current) {
        audioRef.current.src = audioDataUrl;
        audioRef.current.play();
        audioRef.current.onended = () => {
          setIsAiSpeaking(false);
          // Thêm vào history
          setConversationHistory(prev => [...prev, { speaker: line.speaker, text: line.text }]);
          setCurrentIndex(prev => prev + 1);
        };
      }
    } catch {
      showError('Lỗi phát audio');
      setIsAiSpeaking(false);
    }
  }, [script, currentIndex]);

  /**
   * Auto-play mode (Improvement #6)
   * Tự động đọc câu tiếp theo khi AI hoàn thành
   */
  useEffect(() => {
    if (
      autoPlay &&
      script &&
      !isComplete &&
      !isAiSpeaking &&
      !isRecording &&
      !isProcessing &&
      currentIndex < script.length &&
      !script[currentIndex]?.isUserTurn
    ) {
      const timer = setTimeout(() => {
        speakCurrentLine();
      }, 500); // Delay nhỏ để tự nhiên hơn
      return () => clearTimeout(timer);
    }
  }, [autoPlay, script, isComplete, isAiSpeaking, isRecording, isProcessing, currentIndex, speakCurrentLine]);

  /**
   * Hands-only mode (Improvement #7)
   * Tự động skip user turn khi bật chế độ chỉ nghe
   */
  const skipUserTurn = useCallback(async () => {
    if (!script) return;
    
    // AI tiếp tục thay vì user nói
    setConversationHistory(prev => [...prev, { speaker: 'YOU', text: '(Bỏ qua lượt nói)' }]);
    setCurrentIndex(prev => prev + 1);
    
    // Kiểm tra nếu đã hết script
    if (currentIndex + 1 >= script.length) {
      setIsComplete(true);
    }
  }, [script, currentIndex]);

  useEffect(() => {
    const currentLine = script?.[currentIndex];
    if (
      handsOnlyMode &&
      currentLine?.isUserTurn &&
      !isComplete &&
      !isRecording &&
      !isProcessing
    ) {
      const timer = setTimeout(() => {
        skipUserTurn();
      }, 1000); // Delay lâu hơn để user đọc gợi ý
      return () => clearTimeout(timer);
    }
  }, [handsOnlyMode, script, currentIndex, isComplete, isRecording, isProcessing, skipUserTurn]);

  /**
   * Bắt đầu ghi âm user
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunks, { type: 'audio/webm' });
        await processUserInput(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      showError('Không thể truy cập microphone');
    }
  };

  /**
   * Dừng ghi âm
   */
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  /**
   * Xử lý input của user: transcribe và AI tiếp tục
   */
  const processUserInput = async (audioBlob: Blob) => {
    setIsProcessing(true);

    try {
      // 1. Transcribe
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const transcribeRes = await api('/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error('Lỗi nhận dạng giọng nói');
      const { text: userInput } = await transcribeRes.json();

      // Thêm câu user vào history
      setConversationHistory(prev => [...prev, { speaker: 'YOU', text: userInput }]);

      // 2. AI tiếp tục hội thoại
      const continueRes = await api('/ai/continue-conversation', {
        method: 'POST',
        body: JSON.stringify({
          conversationHistory: [...conversationHistory, { speaker: 'YOU', text: userInput }],
          userInput,
          topic,
        }),
      });

      if (!continueRes.ok) throw new Error('Lỗi AI phản hồi');
      const { response, shouldEnd } = await continueRes.json();

      // Thêm phản hồi AI
      setConversationHistory(prev => [...prev, { speaker: 'AI Partner', text: response }]);

      // Đọc phản hồi AI bằng TTS
      await speakAiResponse(response);

      if (shouldEnd) {
        setIsComplete(true);
      } else {
        setCurrentIndex(prev => prev + 1);
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Lỗi xử lý');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * AI đọc phản hồi
   */
  const speakAiResponse = async (text: string) => {
    setIsAiSpeaking(true);

    try {
      const response = await api('/ai/text-to-speech', {
        method: 'POST',
        body: JSON.stringify({ text, voice: 'nova' }),
      });

      if (!response.ok) return;

      const data = await response.json();
      const audioDataUrl = `data:audio/mpeg;base64,${data.audio}`;

      if (audioRef.current) {
        audioRef.current.src = audioDataUrl;
        audioRef.current.play();
        audioRef.current.onended = () => setIsAiSpeaking(false);
      }
    } catch {
      setIsAiSpeaking(false);
    }
  };

  const currentLine = script?.[currentIndex];
  const isUserTurn = currentLine?.isUserTurn && !isRecording && !isProcessing && !isAiSpeaking;

  return (
    <div className="space-y-6">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header with topic and progress (Improvement #4) */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-lg">{topic}</h3>
          <p className="text-sm text-muted-foreground">
            Tham gia hội thoại • {conversationHistory.length} lượt
          </p>
        </div>
        {script && !isComplete && (
          <Badge variant="outline" className="text-sm">
            {currentIndex + 1}/{script.length}
          </Badge>
        )}
        {isGenerating && (
          <Badge variant="secondary" className="animate-pulse">
            Đang tạo...
          </Badge>
        )}
      </div>

      {/* Settings toggles (Improvement #6, #7) */}
      <div className="flex items-center gap-6 p-3 rounded-lg bg-muted/50">
        <div className="flex items-center gap-2">
          <Switch 
            id="autoPlay" 
            checked={autoPlay} 
            onCheckedChange={setAutoPlay}
          />
          <Label htmlFor="autoPlay" className="text-sm cursor-pointer">
            Tự động phát
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch 
            id="handsOnlyMode" 
            checked={handsOnlyMode} 
            onCheckedChange={setHandsOnlyMode}
          />
          <Label htmlFor="handsOnlyMode" className="text-sm cursor-pointer">
            Chỉ nghe (không nói)
          </Label>
        </div>
      </div>

      {/* Scenario - Enhanced (Improvement #4) */}
      {scenario && (
        <Card className="p-6 bg-primary/10 border-l-4 border-primary">
          <p className="text-sm font-medium text-primary mb-2">📍 Tình huống</p>
          <p className="text-lg">{scenario}</p>
        </Card>
      )}

      {/* Conversation history */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {conversationHistory.map((line, index) => (

          <div
            key={index}
            className={`p-4 rounded-lg ${
              line.speaker === 'YOU'
                ? 'bg-primary/20 ml-8'
                : 'bg-muted mr-8'
            }`}
          >
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              line.speaker === 'YOU' ? 'bg-primary text-primary-foreground' : 'bg-accent'
            }`}>
              {line.speaker}
            </span>
            <p className="mt-2">{line.text}</p>
          </div>
        ))}

        {/* Current prompt for user */}
        {currentLine?.isUserTurn && !isComplete && (
          <div className="p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 ml-8 animate-pulse">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-500 text-white">
              🎤 LƯỢT CỦA BẠN
            </span>
            <p className="mt-2 text-muted-foreground italic">{currentLine.text}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        {!script && (
          <Button onClick={generateScript} disabled={isGenerating}>
            {isGenerating ? '⏳ Đang tạo...' : '🎬 Bắt đầu hội thoại'}
          </Button>
        )}

        {script && !isComplete && !currentLine?.isUserTurn && !isAiSpeaking && (
          <Button onClick={speakCurrentLine}>
            ▶️ Tiếp tục
          </Button>
        )}

        {isUserTurn && !isRecording && (
          <Button onClick={startRecording} variant="default">
            🎙️ Nói
          </Button>
        )}

        {isRecording && (
          <Button onClick={stopRecording} variant="destructive">
            ⏹️ Dừng ghi âm
          </Button>
        )}

        {isProcessing && (
          <Button disabled>
            ⏳ Đang xử lý...
          </Button>
        )}

        {isAiSpeaking && (
          <Button disabled variant="outline">
            🔊 AI đang nói...
          </Button>
        )}

        <Button variant="outline" onClick={onBack}>
          ← Quay lại
        </Button>
      </div>

      {/* Completion message */}
      {isComplete && (
        <Card className="p-6 text-center bg-green-100 dark:bg-green-900/30">
          <p className="text-2xl mb-2">🎉 Hoàn thành!</p>
          <p className="text-muted-foreground">Bạn đã hoàn thành cuộc hội thoại</p>
          <Button onClick={generateScript} className="mt-4">
            🔄 Thử lại
          </Button>
        </Card>
      )}
    </div>
  );
}
