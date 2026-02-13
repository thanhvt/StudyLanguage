import {create} from 'zustand';
import type {ReadingConfig, ArticleResult} from '@/services/api/reading';

// =======================
// Reading Store State
// =======================

interface ReadingState {
  /** Cấu hình bài đọc hiện tại */
  config: ReadingConfig;
  /** Kết quả article từ API */
  article: ArticleResult | null;
  /** Đang generate article */
  isGenerating: boolean;
  /** Lỗi (nếu có) */
  error: string | null;
  /** Cỡ chữ hiện tại (sp) */
  fontSize: number;
  /** Từ đã lưu trong session hiện tại */
  savedWords: string[];
}

interface ReadingActions {
  /** Cập nhật config */
  setConfig: (config: Partial<ReadingConfig>) => void;
  /** Set kết quả article */
  setArticle: (result: ArticleResult | null) => void;
  /** Set trạng thái generating */
  setGenerating: (value: boolean) => void;
  /** Set lỗi */
  setError: (error: string | null) => void;
  /** Đổi cỡ chữ */
  setFontSize: (size: number) => void;
  /** Thêm từ vào danh sách đã lưu (không trùng lặp) */
  addSavedWord: (word: string) => void;
  /** Xóa từ khỏi danh sách đã lưu */
  removeSavedWord: (word: string) => void;
  /** Reset về trạng thái ban đầu */
  reset: () => void;
}

const initialState: ReadingState = {
  config: {
    topic: '',
    level: 'intermediate',
    length: 'medium',
  },
  article: null,
  isGenerating: false,
  error: null,
  fontSize: 16,
  savedWords: [],
};

/**
 * Mục đích: Zustand store cho Reading module
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - ArticleScreen: đọc article, điều chỉnh fontSize
 *   - DictionaryPopup: quản lý savedWords
 *   - QuickActions: reset khi bắt đầu bài mới
 */
export const useReadingStore = create<ReadingState & ReadingActions>(
  set => ({
    ...initialState,

    setConfig: config =>
      set(state => ({
        config: {...state.config, ...config},
      })),

    setArticle: result => set({article: result, error: null}),
    setGenerating: value => set({isGenerating: value}),
    setError: error => set({error}),
    setFontSize: size => set({fontSize: size}),

    addSavedWord: word =>
      set(state => ({
        savedWords: state.savedWords.includes(word.toLowerCase())
          ? state.savedWords
          : [...state.savedWords, word.toLowerCase()],
      })),

    removeSavedWord: word =>
      set(state => ({
        savedWords: state.savedWords.filter(w => w !== word.toLowerCase()),
      })),

    reset: () => set(initialState),
  }),
);
