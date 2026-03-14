import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

// ===========================
// MMKV Storage Adapter cho Zustand — thay thế AsyncStorage (nhanh hơn ~30x)
// ===========================
const vocabularyStorage = new MMKV({id: 'vocabulary-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    vocabularyStorage.set(name, value);
  },
  getItem: (name) => {
    return vocabularyStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    vocabularyStorage.delete(name);
  },
};

// =======================
// Vocabulary Store — Từ vựng đã lưu (persist qua MMKV)
// =======================

/**
 * Mục đích: Lưu trữ từ vựng đã lưu từ Listening (persist vĩnh viễn)
 * Khi nào sử dụng:
 *   - PlayerScreen (Listening): user tap từ → lưu vào store
 *   - VocabularyTab (History): hiển thị + xóa từ đã lưu
 *
 * Lưu ý: Store này tách biệt khỏi useListeningStore
 * để đảm bảo persist chỉ cho saved words mà không ảnh hưởng state khác.
 */

export interface VocabWord {
  /** Từ đã lưu (lowercase) */
  word: string;
  /** Nguồn: listening */
  source: 'listening';
  /** Thời điểm lưu (ISO string) */
  savedAt: string;
  /** Nghĩa (nếu có) */
  meaning?: string;
  /** Ngữ cảnh câu chứa từ */
  context?: string;
}

interface VocabularyState {
  /** Danh sách từ đã lưu */
  words: VocabWord[];
}

interface VocabularyActions {
  /**
   * Mục đích: Thêm từ mới vào danh sách (không trùng lặp)
   * Tham số đầu vào: word (string), source ('listening'), meaning?, context?
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap "Lưu từ" trong DictionaryPopup
   */
  addWord: (
    word: string,
    source: 'listening',
    meaning?: string,
    context?: string,
  ) => void;

  /**
   * Mục đích: Xóa từ khỏi danh sách
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: void
   * Khi nào sử dụng: User tap nút xóa trong VocabularyTab
   */
  removeWord: (word: string) => void;

  /**
   * Mục đích: Kiểm tra từ đã lưu chưa
   * Tham số đầu vào: word (string)
   * Tham số đầu ra: boolean
   * Khi nào sử dụng: DictionaryPopup hiển thị trạng thái đã lưu/chưa
   */
  hasWord: (word: string) => boolean;

  /**
   * Mục đích: Xóa tất cả từ đã lưu
   * Tham số đầu vào: không
   * Tham số đầu ra: void
   * Khi nào sử dụng: User chọn "Xóa hết" trong VocabularyTab
   */
  clearAll: () => void;
}

export const useVocabularyStore = create<VocabularyState & VocabularyActions>()(
  persist(
    (set, get) => ({
      words: [],

      addWord: (word, source, meaning, context) => {
        const normalized = word.toLowerCase().trim();
        const existing = get().words.find(w => w.word === normalized);
        if (existing) {
          console.log('📚 [Vocabulary] Từ đã tồn tại:', normalized);
          return;
        }

        console.log('📚 [Vocabulary] Lưu từ mới:', normalized, '| Nguồn:', source);
        set(state => ({
          words: [
            {
              word: normalized,
              source,
              savedAt: new Date().toISOString(),
              meaning,
              context,
            },
            ...state.words,
          ],
        }));
      },

      removeWord: (word) => {
        const normalized = word.toLowerCase().trim();
        console.log('📚 [Vocabulary] Xóa từ:', normalized);
        set(state => ({
          words: state.words.filter(w => w.word !== normalized),
        }));
      },

      hasWord: (word) => {
        return get().words.some(w => w.word === word.toLowerCase().trim());
      },

      clearAll: () => {
        console.log('📚 [Vocabulary] Xóa tất cả từ đã lưu');
        set({words: []});
      },
    }),
    {
      name: 'vocabulary-store',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
