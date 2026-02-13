import {create} from 'zustand';
import type {
  ListeningConfig,
  ConversationResult,
  ConversationTimestamp,
} from '@/services/api/listening';
import type {TopicScenario} from '@/data/topic-data';

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
  /** TTS provider đang chọn (openai hoặc azure) */
  ttsProvider: 'openai' | 'azure';
  /** Voice đang chọn cho TTS (null = random/auto) */
  selectedVoice: string | null;
  /** Danh sách các exchange index đã bookmark trong session hiện tại */
  bookmarkedIndexes: number[];
  /** Danh sách từ đã lưu từ Dictionary Popup */
  savedWords: string[];
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
  /** Set TTS provider (openai/azure) */
  setTtsProvider: (provider: 'openai' | 'azure') => void;
  /** Set voice cho TTS */
  setSelectedVoice: (voice: string | null) => void;
  /** Toggle bookmark cho 1 exchange (thêm/bỏ khỏi danh sách) */
  toggleBookmark: (index: number) => void;
  /** Set danh sách bookmark indexes (khi load từ server) */
  setBookmarkedIndexes: (indexes: number[]) => void;
  /** Thêm từ vào danh sách đã lưu (không trùng lặp) */
  addSavedWord: (word: string) => void;
  /** Xóa từ khỏi danh sách đã lưu */
  removeSavedWord: (word: string) => void;
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
  ttsProvider: 'openai',
  selectedVoice: null,
  bookmarkedIndexes: [],
  savedWords: [],
};

/**
 * Mục đích: Zustand store cho Listening module
 * Khi nào sử dụng:
 *   - ConfigScreen: đọc/ghi config, gọi generate
 *   - TopicPicker: đọc/ghi selectedTopic, selectedCategory, favorites
 *   - PlayerScreen: đọc conversation, điều khiển playback, audio state
 *   - QuickActions: reset khi bắt đầu bài mới
 */
export const useListeningStore = create<ListeningState & ListeningActions>(
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
    setCurrentExchangeIndex: index => set({currentExchangeIndex: index}),
    setPlaybackSpeed: speed => set({playbackSpeed: speed}),

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
    setTtsProvider: provider => set({ttsProvider: provider}),
    setSelectedVoice: voice => set({selectedVoice: voice}),

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

    reset: () => set(initialState),
  }),
);

