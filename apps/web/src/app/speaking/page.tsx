'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

/**
 * Speaking Page - Module Luyện Nói
 *
 * Mục đích: UI cho tính năng luyện nói và đánh giá phát âm
 * Flow: Nhập topic → AI sinh text mẫu → User ghi âm → AI đánh giá
 */
export default function SpeakingPage() {
  // Form state
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');

  // Content state
  const [sampleText, setSampleText] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Feedback state
  const [feedback, setFeedback] = useState<{
    overallScore: number;
    feedback: {
      wrongWords: { word: string; userSaid: string; suggestion: string }[];
      tips: string[];
      encouragement: string;
    };
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /**
   * Sinh đoạn text mẫu để luyện nói
   */
  const handleGenerateSample = async () => {
    if (!topic.trim()) {
      setError('Vui lòng nhập chủ đề');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setFeedback(null);

    try {
      const response = await fetch('http://localhost:3001/api/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Tạo một đoạn văn ngắn (3-5 câu) bằng tiếng Anh về chủ đề "${topic}" để người học luyện nói. ${keywords ? `Sử dụng các từ khóa: ${keywords}` : ''} Chỉ trả về đoạn văn, không có gì khác.`,
        }),
      });

      if (!response.ok) throw new Error('Lỗi sinh text');

      const data = await response.json();
      setSampleText(data.text);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Bắt đầu ghi âm
   */
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setError('Không thể truy cập microphone');
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
   * Đánh giá phát âm
   */
  const handleEvaluate = async () => {
    if (!audioBlob || !sampleText) return;

    setIsEvaluating(true);
    setError(null);

    try {
      // Bước 1: Transcribe audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const transcribeRes = await fetch('http://localhost:3001/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeRes.ok) throw new Error('Lỗi nhận dạng giọng nói');
      const { text: userTranscript } = await transcribeRes.json();

      // Bước 2: Đánh giá
      const evalRes = await fetch('http://localhost:3001/api/ai/evaluate-pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: sampleText,
          userTranscript,
        }),
      });

      if (!evalRes.ok) throw new Error('Lỗi đánh giá');
      const feedbackData = await evalRes.json();
      setFeedback(feedbackData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsEvaluating(false);
    }
  };

  /**
   * Reset để luyện lại
   */
  const handleRetry = () => {
    setAudioBlob(null);
    setFeedback(null);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">🎤 Luyện Nói - AI Coach</h1>

      {/* Form nhập topic */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Bước 1: Chọn chủ đề</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Chủ đề *</label>
            <Input
              placeholder="VD: Giới thiệu bản thân, Du lịch..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Từ khóa (tùy chọn)</label>
            <Input
              placeholder="VD: hobby, travel, work"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerateSample}
          disabled={isGenerating}
          className="mt-4"
        >
          {isGenerating ? '⏳ Đang tạo...' : '✨ Tạo bài mẫu'}
        </Button>
      </Card>

      {/* Hiển thị text mẫu và ghi âm */}
      {sampleText && (
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Bước 2: Đọc đoạn văn sau</h2>

          <div className="p-4 bg-muted rounded-lg mb-4">
            <p className="text-lg leading-relaxed">{sampleText}</p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {!isRecording ? (
              <Button onClick={startRecording} disabled={!!audioBlob}>
                🎙️ Bắt đầu ghi âm
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive">
                ⏹️ Dừng ghi âm
              </Button>
            )}

            {audioBlob && !feedback && (
              <Button onClick={handleEvaluate} disabled={isEvaluating}>
                {isEvaluating ? '⏳ Đang đánh giá...' : '📊 Đánh giá phát âm'}
              </Button>
            )}

            {audioBlob && (
              <Button variant="outline" onClick={handleRetry}>
                🔄 Luyện lại
              </Button>
            )}
          </div>

          {audioBlob && (
            <audio controls className="mt-4 w-full" src={URL.createObjectURL(audioBlob)} />
          )}
        </Card>
      )}

      {/* Hiển thị feedback */}
      {feedback && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Kết quả đánh giá</h2>

          {/* Điểm tổng */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary">
              {feedback.overallScore}/10
            </div>
            <p className="text-muted-foreground mt-2">{feedback.feedback.encouragement}</p>
          </div>

          {/* Từ sai */}
          {feedback.feedback.wrongWords.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">❌ Từ cần cải thiện:</h3>
              <ul className="space-y-2">
                {feedback.feedback.wrongWords.map((w, i) => (
                  <li key={i} className="p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <span className="font-medium">{w.word}</span>
                    <span className="text-muted-foreground"> → Bạn nói: &ldquo;{w.userSaid}&rdquo;</span>
                    <br />
                    <span className="text-sm">💡 Gợi ý: {w.suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips */}
          {feedback.feedback.tips.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">💡 Mẹo cải thiện:</h3>
              <ul className="list-disc list-inside space-y-1">
                {feedback.feedback.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {error && (
        <p className="text-red-500 text-sm mt-4">{error}</p>
      )}
    </div>
  );
}
