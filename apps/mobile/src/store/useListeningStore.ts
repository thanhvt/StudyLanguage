import {create} from 'zustand';
import {persist, createJSONStorage, StateStorage} from 'zustand/middleware';
import {MMKV} from 'react-native-mmkv';

// ===========================
// MMKV Storage Adapter cho Zustand — thay thế AsyncStorage (nhanh hơn ~30x)
// ===========================
const listeningStorage = new MMKV({id: 'listening-storage'});

const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    listeningStorage.set(name, value);
  },
  getItem: (name) => {
    return listeningStorage.getString(name) ?? null;
  },
  removeItem: (name) => {
    listeningStorage.delete(name);
  },
};
import type {
  ListeningConfig,
  ConversationResult,
  ConversationTimestamp,
  WordTimestamp,
} from '@/services/api/listening';
import type {TopicScenario} from '@/data/topic-data';
import type {CustomCategory} from '@/services/api/customCategories';

// =======================
// Listening Store State
// =======================

interface ListeningState {
  /** Cấu hình bài nghe hiện tại */
  config: ListeningConfig;
  /** Kết quả conversation từ API */
  conversation: ConversationResult | null;
  /** Đang generate conversation */
  isGenerating: boolean;
  /** Trạng thái phát audio */
  isPlaying: boolean;
  /** Vị trí transcript hiện tại (index của exchange đang phát) */
  currentExchangeIndex: number;
  /** Tốc độ phát */
  playbackSpeed: number;
  /** Topic đang chọn từ TopicPicker */
  selectedTopic: TopicScenario | null;
  /** Category ID đang chọn */
  selectedCategory: string;
  /** SubCategory ID đang mở */
  selectedSubCategory: string;
  /** Danh sách scenario ID đã favorite (lưu local) */
  favoriteScenarioIds: string[];
  /** URL audio TTS đã sinh */
  audioUrl: string | null;
  /** Đang sinh audio TTS */
  isGeneratingAudio: boolean;
  /** Timestamps cho từng câu — sync audio với transcript */
  timestamps: ConversationTimestamp[] | null;
  /** Word timestamps cho từng câu — word-level karaoke highlight */
  wordTimestamps: WordTimestamp[][] | null;
  /** Giọng đọc random hay chọn thủ công */
  randomVoice: boolean;
  /** Map voice đã chọn cho từng speaker (speakerLabel → voiceId) */
  voicePerSpeaker: Record<string, string>;
  /** Multi-talker mode (Azure DragonHD) */
  multiTalker: boolean;
  /** Index cặp giọng multi-talker (0 = Ava-Andrew, 1 = Ava-Steffan) */
  multiTalkerPairIndex: number;
  /** Danh sách các exchange index đã bookmark trong session hiện tại */
  bookmarkedIndexes: number[];
  /** Danh sách từ đã lưu từ Dictionary Popup */
  savedWords: string[];
  /** Hiển thị bản dịch tiếng Việt hay không */
  showTranslation: boolean;
  /** Emotion cho Azure TTS (express-as style) */
  ttsEmotion: string;
  /** Pitch adjustment -20 to +20 (%) */
  ttsPitch: number;
  /** Rate adjustment -20 to +20 (%) */
  ttsRate: number;
  /** Volume 0-100 (%) */
  ttsVolume: number;
  /** Cảm xúc ngẫu nhiên — API tự chọn emotion, emotion chips dimmed */
  randomEmotion: boolean;
  /** Map speaker → voice ID thực tế đã dùng (từ API response, để hiển thị tên giọng đọc) */
  activeVoiceMap: Record<string, string>;
  /** Danh sách custom categories của user */
  customCategories: CustomCategory[];
  /** Đã load custom categories từ API chưa */
  customCategoriesLoaded: boolean;
}

interface ListeningActions {
  /** Cập nhật config */
  setConfig: (config: Partial<ListeningConfig>) => void;
  /** Set kết quả conversation */
  setConversation: (result: ConversationResult | null) => void;
  /** Set trạng thái generating */
  setGenerating: (value: boolean) => void;
  /** Toggle play/pause */
  togglePlaying: () => void;
  /** Set đang phát hay không */
  setPlaying: (value: boolean) => void;
  /** Set exchange index hiện tại */
  setCurrentExchangeIndex: (index: number) => void;
  /** Đổi tốc độ phát */
  setPlaybackSpeed: (speed: number) => void;
  /** Chọn topic từ TopicPicker */
  setSelectedTopic: (
    topic: TopicScenario | null,
    categoryId?: string,
    subCategoryId?: string,
  ) => void;
  /** Chọn category tab */
  setSelectedCategory: (categoryId: string) => void;
  /** Mở/đóng subcategory */
  setSelectedSubCategory: (subCategoryId: string) => void;
  /** Toggle favorite cho 1 scenario */
  toggleFavorite: (scenarioId: string) => void;
  /** Set audio URL sau khi TTS sinh xong */
  setAudioUrl: (url: string | null) => void;
  /** Set trạng thái đang sinh audio */
  setGeneratingAudio: (value: boolean) => void;
  /** Set timestamps cho transcript sync */
  setTimestamps: (ts: ConversationTimestamp[] | null) => void;
  /** Set word timestamps cho word-level karaoke highlight */
  setWordTimestamps: (wt: WordTimestamp[][] | null) => void;
  /** Set random voice on/off */
  setRandomVoice: (value: boolean) => void;
  /** Set voice cho từng speaker */
  setVoicePerSpeaker: (map: Record<string, string>) => void;
  /** Set multi-talker mode */
  setMultiTalker: (value: boolean) => void;
  /** Set multi-talker pair index */
  setMultiTalkerPairIndex: (index: number) => void;
  /** Toggle bookmark cho 1 exchange (thêm/bỏ khỏi danh sách) */
  toggleBookmark: (index: number) => void;
  /** Set danh sách bookmark indexes (khi load từ server) */
  setBookmarkedIndexes: (indexes: number[]) => void;
  /** Thêm từ vào danh sách đã lưu (không trùng lặp) */
  addSavedWord: (word: string) => void;
  /** Xóa từ khỏi danh sách đã lưu */
  removeSavedWord: (word: string) => void;
  /** Toggle hiển thị bản dịch tiếng Việt */
  toggleTranslation: () => void;
  /** Set TTS emotion style */
  setTtsEmotion: (emotion: string) => void;
  /** Set TTS pitch (-20 to +20) */
  setTtsPitch: (pitch: number) => void;
  /** Set TTS rate (-20 to +20) */
  setTtsRate: (rate: number) => void;
  /** Set TTS volume (0-100) */
  setTtsVolume: (volume: number) => void;
  /** Set random emotion on/off */
  setRandomEmotion: (value: boolean) => void;
  /** Cập nhật voice map thực tế từ API response */
  setActiveVoiceMap: (map: Record<string, string>) => void;
  /** Set danh sách custom categories */
  setCustomCategories: (categories: CustomCategory[]) => void;
  /** Thêm 1 custom category mới vào danh sách */
  addCustomCategory: (category: CustomCategory) => void;
  /** Cập nhật 1 custom category */
  updateCustomCategory: (id: string, data: Partial<CustomCategory>) => void;
  /** Xóa 1 custom category khỏi danh sách */
  removeCustomCategory: (id: string) => void;
  /** Reset về trạng thái ban đầu */
  reset: () => void;
}

const initialState: ListeningState = {
  config: {
    topic: '',
    durationMinutes: 5,
    level: 'intermediate',
    includeVietnamese: true,
    numSpeakers: 2,
    keywords: '',
  },
  conversation: null,
  isGenerating: false,
  isPlaying: false,
  currentExchangeIndex: 0,
  playbackSpeed: 1,
  selectedTopic: null,
  selectedCategory: 'it',
  selectedSubCategory: '',
  favoriteScenarioIds: [],
  audioUrl: null,
  isGeneratingAudio: false,
  timestamps: null,
  wordTimestamps: null,
  randomVoice: true,
  voicePerSpeaker: {},
  multiTalker: false,
  multiTalkerPairIndex: 0,
  bookmarkedIndexes: [],
  savedWords: [],
  showTranslation: true,
  ttsEmotion: 'default',
  ttsPitch: 0,
  ttsRate: 0,
  ttsVolume: 100,
  randomEmotion: false,
  activeVoiceMap: {},
  customCategories: [],
  customCategoriesLoaded: false,
};

/**
 * Mục đích: Zustand store cho Listening module
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - TopicPicker: đọc/ghi selectedTopic, selectedCategory, favorites
 *   - PlayerScreen: đọc conversation, điều khiển playback, audio state
 *   - QuickActions: reset khi bắt đầu bài mới
 */
export const useListeningStore = create<ListeningState & ListeningActions>()(
  persist(
    set => ({
    ...initialState,

    setConfig: config =>
      set(state => ({
        config: {...state.config, ...config},
      })),

    setConversation: result => set({conversation: result}),
    setGenerating: value => set({isGenerating: value}),
    togglePlaying: () => set(state => ({isPlaying: !state.isPlaying})),
    setPlaying: value => set({isPlaying: value}),
    // BUG-04 fix: Clamp index để không bị âm
    setCurrentExchangeIndex: index => set({currentExchangeIndex: Math.max(0, index)}),
    // EC-M04 fix: Clamp speed trong [0.25, 4.0] để tránh giá trị 0 hoặc âm
    setPlaybackSpeed: speed => set({playbackSpeed: Math.max(0.25, Math.min(4.0, speed))}),

    setSelectedTopic: (topic, categoryId, subCategoryId) =>
      set(state => ({
        selectedTopic: topic,
        selectedCategory: categoryId ?? state.selectedCategory,
        selectedSubCategory: subCategoryId ?? state.selectedSubCategory,
        config: {
          ...state.config,
          topic: topic?.name ?? '',
        },
      })),

    setSelectedCategory: categoryId => set({selectedCategory: categoryId}),
    setSelectedSubCategory: subCategoryId =>
      set(state => ({
        selectedSubCategory:
          state.selectedSubCategory === subCategoryId ? '' : subCategoryId,
      })),

    toggleFavorite: scenarioId =>
      set(state => ({
        favoriteScenarioIds: state.favoriteScenarioIds.includes(scenarioId)
          ? state.favoriteScenarioIds.filter(id => id !== scenarioId)
          : [...state.favoriteScenarioIds, scenarioId],
      })),

    setAudioUrl: url => set({audioUrl: url}),
    setGeneratingAudio: value => set({isGeneratingAudio: value}),
    setTimestamps: ts => set({timestamps: ts}),
    setWordTimestamps: wt => set({wordTimestamps: wt}),
    setRandomVoice: value => set({randomVoice: value}),
    setVoicePerSpeaker: map => set({voicePerSpeaker: map}),
    setMultiTalker: value => set({multiTalker: value}),
    setMultiTalkerPairIndex: index => set({multiTalkerPairIndex: index}),

    toggleBookmark: index =>
      set(state => ({
        bookmarkedIndexes: state.bookmarkedIndexes.includes(index)
          ? state.bookmarkedIndexes.filter(i => i !== index)
          : [...state.bookmarkedIndexes, index],
      })),
    setBookmarkedIndexes: indexes => set({bookmarkedIndexes: indexes}),

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

    toggleTranslation: () =>
      set(state => ({showTranslation: !state.showTranslation})),

    setTtsEmotion: emotion => set({ttsEmotion: emotion}),
    setTtsPitch: pitch => set({ttsPitch: Math.max(-20, Math.min(20, pitch))}),
    setTtsRate: rate => set({ttsRate: Math.max(-20, Math.min(20, rate))}),
    setTtsVolume: volume => set({ttsVolume: Math.max(0, Math.min(100, volume))}),
    setRandomEmotion: value => set({randomEmotion: value}),
    setActiveVoiceMap: map => set({activeVoiceMap: map}),

    setCustomCategories: categories =>
      set({customCategories: categories, customCategoriesLoaded: true}),

    addCustomCategory: category =>
      set(state => ({
        customCategories: [...state.customCategories, category],
      })),

    updateCustomCategory: (id, data) =>
      set(state => ({
        customCategories: state.customCategories.map(c =>
          c.id === id ? {...c, ...data} : c,
        ),
      })),

    removeCustomCategory: id =>
      set(state => ({
        customCategories: state.customCategories.filter(c => c.id !== id),
      })),

    reset: () => set(initialState),
    }),
    {
      name: 'listening-store',
      storage: createJSONStorage(() => mmkvStorage),
      // Chỉ persist favoriteScenarioIds — các state khác là session-specific
      partialize: (state) => ({
        favoriteScenarioIds: state.favoriteScenarioIds,
        customCategories: state.customCategories,
        customCategoriesLoaded: state.customCategoriesLoaded,
      }),
    },
  ),
);

