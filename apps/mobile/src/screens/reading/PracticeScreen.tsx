import React, {useState, useCallback, useMemo} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {AppText} from '@/components/ui';
import AppButton from '@/components/ui/AppButton';
import Icon from '@/components/ui/Icon';
import {useColors} from '@/hooks/useColors';
import {useReadingStore} from '@/store/useReadingStore';
import {SKILL_COLORS} from '@/config/skillColors';
import {useReadingPractice} from '@/hooks/useReadingPractice';

/**
 * Mục đích: Màn hình luyện đọc — user đọc theo bài rồi nhận feedback AI
 * Tham số đầu vào: không có (lấy article từ store)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: User navigate từ ArticleScreen → 'Practice'
 *   - Hiển thị đoạn văn gốc (nửa trên)
 *   - Khu vực ghi âm + transcript (nửa dưới)
 *   - Nút 🎤 bắt đầu / ⏹️ dừng
 *   - Kết quả phân tích: accuracy, fluency, errors
 */
export default function PracticeScreen() {
  const navigation = useNavigation<any>();
  const colors = useColors();
  const readingColor = SKILL_COLORS.reading.dark;

  const {article, fontSize} = useReadingStore();

  // Danh sách đoạn văn
  const paragraphs = useMemo(
    () => article?.content?.split('\n').filter(p => p.trim()) ?? [],
    [article?.content],
  );

  // Đoạn đang luyện (index)
  const [selectedParagraph, setSelectedParagraph] = useState(0);
  const currentText = paragraphs[selectedParagraph] ?? '';

  // Practice hook
  const practice = useReadingPractice(currentText);

  /**
   * Mục đích: Chuyển sang đoạn tiếp theo
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Đoạn tiếp" sau khi xem kết quả
   */
  const handleNextParagraph = useCallback(() => {
    if (selectedParagraph < paragraphs.length - 1) {
      setSelectedParagraph(prev => prev + 1);
      practice.resetPractice();
    }
  }, [selectedParagraph, paragraphs.length, practice]);

  /**
   * Mục đích: Quay lại đoạn trước
   * Tham số đầu vào: không có
   * Tham số đầu ra: void
   * Khi nào sử dụng: User nhấn "Đoạn trước"
   */
  const handlePrevParagraph = useCallback(() => {
    if (selectedParagraph > 0) {
      setSelectedParagraph(prev => prev - 1);
      practice.resetPractice();
    }
  }, [selectedParagraph, practice]);

  /**
   * Mục đích: Tính màu cho accuracy score
   * Tham số đầu vào: score (number) — 0-100
   * Tham số đầu ra: string — màu hex
   * Khi nào sử dụng: Hiển thị score badge trong kết quả
   */
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // Xanh lá - giỏi
    if (score >= 60) return '#f59e0b'; // Vàng cam - khá
    return '#ef4444'; // Đỏ - cần cải thiện
  };

  // =======================
  // Render
  // =======================

  if (!article || paragraphs.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <AppText variant="body" className="text-neutrals400" raw>
          Chưa có bài đọc để luyện.
        </AppText>
        <AppButton variant="primary" className="mt-4" onPress={() => navigation.goBack()}>
          Quay lại
        </AppButton>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-2 pb-3 border-b border-neutrals900">
        <AppButton
          variant="ghost"
          size="icon"
          onPress={() => navigation.goBack()}
          icon={<Icon name="ArrowLeft" className="w-5 h-5 text-foreground" />}
        >
          {''}
        </AppButton>
        <View className="flex-1 mx-3">
          <AppText variant="body" weight="semibold" numberOfLines={1} raw>
            Luyện đọc
          </AppText>
          <AppText variant="bodySmall" className="text-neutrals400" raw>
            Đoạn {selectedParagraph + 1}/{paragraphs.length}
          </AppText>
        </View>
        {/* Nút chuyển đoạn */}
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={handlePrevParagraph}
            disabled={selectedParagraph === 0}
            className="w-8 h-8 items-center justify-center rounded-lg"
            style={{backgroundColor: colors.neutrals800}}
          >
            <Icon
              name="ChevronLeft"
              className="w-4 h-4"
              style={{
                color: selectedParagraph === 0
                  ? colors.neutrals600
                  : colors.foreground,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleNextParagraph}
            disabled={selectedParagraph >= paragraphs.length - 1}
            className="w-8 h-8 items-center justify-center rounded-lg"
            style={{backgroundColor: colors.neutrals800}}
          >
            <Icon
              name="ChevronRight"
              className="w-4 h-4"
              style={{
                color: selectedParagraph >= paragraphs.length - 1
                  ? colors.neutrals600
                  : colors.foreground,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* ===== PHẦN TRÊN: Đoạn văn gốc ===== */}
        <View className="px-4 py-4 border-b border-neutrals900">
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name="BookOpen" className="w-4 h-4" style={{color: readingColor}} />
            <AppText variant="bodySmall" weight="semibold" style={{color: readingColor}} raw>
              Bài gốc — Đọc to đoạn này
            </AppText>
          </View>
          <AppText
            style={{
              fontSize,
              lineHeight: fontSize * 1.7,
              color: colors.foreground,
            }}
            raw
          >
            {currentText}
          </AppText>
        </View>

        {/* ===== PHẦN DƯỚI: Transcript + Controls ===== */}
        <View className="px-4 py-4">
          {/* Transcript area */}
          <View className="flex-row items-center gap-2 mb-3">
            <Icon name="Mic" className="w-4 h-4" style={{color: colors.neutrals400}} />
            <AppText variant="bodySmall" weight="semibold" className="text-neutrals400" raw>
              Bạn đọc
            </AppText>
          </View>

          <View
            className="min-h-[100px] rounded-xl p-4 mb-4"
            style={{backgroundColor: colors.neutrals800 + '80'}}
          >
            {practice.phase === 'idle' && !practice.transcript && (
              <AppText variant="body" className="text-neutrals500 italic" raw>
                Nhấn nút 🎤 bên dưới để bắt đầu đọc...
              </AppText>
            )}
            {practice.phase === 'recording' && (
              <View className="flex-row items-center gap-2 mb-2">
                <View
                  className="w-3 h-3 rounded-full"
                  style={{backgroundColor: '#ef4444'}}
                />
                <AppText variant="bodySmall" className="text-error" raw>
                  Đang ghi âm...
                </AppText>
              </View>
            )}
            {practice.transcript ? (
              <AppText
                style={{
                  fontSize: fontSize - 1,
                  lineHeight: (fontSize - 1) * 1.6,
                  color: colors.foreground,
                }}
                raw
              >
                {practice.transcript}
              </AppText>
            ) : null}
          </View>

          {/* Record / Stop button */}
          <View className="items-center mb-6">
            {practice.phase === 'idle' || practice.phase === 'result' ? (
              <TouchableOpacity
                onPress={practice.startRecording}
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{backgroundColor: readingColor}}
                accessibilityLabel="Bắt đầu ghi âm"
              >
                <Icon name="Mic" className="w-7 h-7" style={{color: '#000'}} />
              </TouchableOpacity>
            ) : practice.phase === 'recording' ? (
              <TouchableOpacity
                onPress={practice.stopRecording}
                className="w-16 h-16 rounded-full items-center justify-center"
                style={{backgroundColor: '#ef4444'}}
                accessibilityLabel="Dừng ghi âm"
              >
                <Icon name="Square" className="w-6 h-6" style={{color: '#fff'}} />
              </TouchableOpacity>
            ) : (
              /* Analyzing state */
              <View className="w-16 h-16 rounded-full items-center justify-center bg-neutrals800">
                <ActivityIndicator size="small" color={readingColor} />
              </View>
            )}
            <AppText variant="bodySmall" className="text-neutrals400 mt-2" raw>
              {practice.phase === 'recording'
                ? 'Nhấn ⏹️ khi đọc xong'
                : practice.phase === 'analyzing'
                  ? 'Đang phân tích...'
                  : 'Nhấn 🎤 để bắt đầu'}
            </AppText>
          </View>

          {/* Error */}
          {practice.error && (
            <View className="bg-error/10 rounded-xl p-4 mb-4">
              <View className="flex-row items-center gap-2">
                <Icon name="TriangleAlert" className="w-4 h-4 text-error" />
                <AppText variant="bodySmall" className="text-error" raw>
                  {practice.error}
                </AppText>
              </View>
            </View>
          )}

          {/* ===== KẾT QUẢ PHÂN TÍCH ===== */}
          {practice.phase === 'result' && practice.result && (
            <View className="mt-2">
              {/* Score cards */}
              <View className="flex-row gap-3 mb-4">
                {/* Accuracy */}
                <View
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{backgroundColor: colors.neutrals800}}
                >
                  <AppText
                    variant="heading2"
                    weight="bold"
                    style={{color: getScoreColor(practice.result.accuracy)}}
                    raw
                  >
                    {Math.round(practice.result.accuracy)}%
                  </AppText>
                  <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
                    Chính xác
                  </AppText>
                </View>
                {/* Fluency */}
                <View
                  className="flex-1 rounded-xl p-4 items-center"
                  style={{backgroundColor: colors.neutrals800}}
                >
                  <AppText
                    variant="heading2"
                    weight="bold"
                    style={{color: getScoreColor(practice.result.fluencyScore)}}
                    raw
                  >
                    {Math.round(practice.result.fluencyScore)}%
                  </AppText>
                  <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
                    Trôi chảy
                  </AppText>
                </View>
              </View>

              {/* Errors list */}
              {practice.result.errors.length > 0 && (
                <View className="mb-4">
                  <AppText variant="bodySmall" weight="semibold" className="text-neutrals300 mb-2" raw>
                    Lỗi cần sửa:
                  </AppText>
                  {practice.result.errors.map((err, idx) => (
                    <View
                      key={idx}
                      className="rounded-lg p-3 mb-2"
                      style={{backgroundColor: colors.neutrals800}}
                    >
                      <View className="flex-row items-center gap-2 mb-1">
                        <AppText
                          variant="bodySmall"
                          style={{textDecorationLine: 'line-through', color: '#ef4444'}}
                          raw
                        >
                          {err.spoken}
                        </AppText>
                        <Icon name="ArrowRight" className="w-3 h-3" style={{color: colors.neutrals500}} />
                        <AppText
                          variant="bodySmall"
                          weight="semibold"
                          style={{color: '#22c55e'}}
                          raw
                        >
                          {err.original}
                        </AppText>
                      </View>
                      {err.suggestion && (
                        <AppText variant="bodySmall" className="text-neutrals400 mt-1" raw>
                          💡 {err.suggestion}
                        </AppText>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* AI Feedback */}
              {practice.result.feedback && (
                <View
                  className="rounded-xl p-4 mb-4"
                  style={{backgroundColor: readingColor + '15'}}
                >
                  <AppText variant="bodySmall" weight="semibold" style={{color: readingColor}} raw>
                    💬 Nhận xét
                  </AppText>
                  <AppText variant="bodySmall" className="text-neutrals300 mt-2" raw>
                    {practice.result.feedback}
                  </AppText>
                </View>
              )}

              {/* Action buttons */}
              <View className="flex-row gap-3">
                <AppButton
                  variant="outline"
                  className="flex-1"
                  onPress={practice.resetPractice}
                  style={{borderColor: readingColor}}
                >
                  🔄 Đọc lại
                </AppButton>
                {selectedParagraph < paragraphs.length - 1 && (
                  <AppButton
                    variant="primary"
                    className="flex-1"
                    onPress={handleNextParagraph}
                    style={{backgroundColor: readingColor}}
                  >
                    ▶️ Đoạn tiếp
                  </AppButton>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Bottom padding */}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
