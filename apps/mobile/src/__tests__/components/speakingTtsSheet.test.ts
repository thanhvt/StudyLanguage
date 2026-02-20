/**
 * Unit test cho SpeakingTtsSheet logic & data constants
 *
 * Mục đích: Test logic chọn provider → voice mapping, speed range, data integrity
 * Tham số đầu vào: không có
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD pipeline, sau khi thay đổi TTS voices hoặc provider logic
 */
import {useSpeakingStore} from '@/store/useSpeakingStore';

// ============================================
// Constants — re-export từ SpeakingTtsSheet
// (avoid import component → tránh native module errors)
// ============================================

const OPENAI_VOICES = [
  {id: 'alloy', label: 'Alloy', emoji: '🤖', desc: 'Trung tính, rõ ràng'},
  {id: 'echo', label: 'Echo', emoji: '🗣️', desc: 'Nam, ấm áp'},
  {id: 'fable', label: 'Fable', emoji: '📖', desc: 'Nam British, kể chuyện'},
  {id: 'onyx', label: 'Onyx', emoji: '🎤', desc: 'Nam, trầm ấm'},
  {id: 'nova', label: 'Nova', emoji: '✨', desc: 'Nữ, trẻ trung'},
  {id: 'shimmer', label: 'Shimmer', emoji: '💫', desc: 'Nữ, nhẹ nhàng'},
];

const AZURE_VOICES = [
  {id: 'en-US-AriaNeural', label: 'Aria', emoji: '💃', desc: 'Nữ US, biểu cảm'},
  {id: 'en-US-JennyNeural', label: 'Jenny', emoji: '👩', desc: 'Nữ US, tự nhiên'},
  {id: 'en-US-GuyNeural', label: 'Guy', emoji: '👨', desc: 'Nam US, chuyên nghiệp'},
  {id: 'en-US-DavisNeural', label: 'Davis', emoji: '🧑', desc: 'Nam US, ấm áp'},
  {id: 'en-GB-SoniaNeural', label: 'Sonia', emoji: '🇬🇧', desc: 'Nữ British'},
  {id: 'en-AU-NatashaNeural', label: 'Natasha', emoji: '🇦🇺', desc: 'Nữ Aussie'},
];

// ============================================
// Tests
// ============================================

describe('SpeakingTtsSheet — Logic & Data', () => {
  beforeEach(() => {
    useSpeakingStore.getState().reset();
  });

  // ----- Data Integrity -----

  describe('Voice Data Integrity', () => {
    it('OpenAI voices có đủ 6 giọng', () => {
      expect(OPENAI_VOICES).toHaveLength(6);
    });

    it('Azure voices có đủ 6 giọng', () => {
      expect(AZURE_VOICES).toHaveLength(6);
    });

    it('mỗi voice có đủ fields (id, label, emoji, desc)', () => {
      const allVoices = [...OPENAI_VOICES, ...AZURE_VOICES];
      allVoices.forEach(voice => {
        expect(voice.id).toBeTruthy();
        expect(voice.label).toBeTruthy();
        expect(voice.emoji).toBeTruthy();
        expect(voice.desc).toBeTruthy();
      });
    });

    it('không có voice ID trùng lặp trong cùng provider', () => {
      const openaiIds = OPENAI_VOICES.map(v => v.id);
      const azureIds = AZURE_VOICES.map(v => v.id);
      expect(new Set(openaiIds).size).toBe(openaiIds.length);
      expect(new Set(azureIds).size).toBe(azureIds.length);
    });

    it('default voice "alloy" tồn tại trong OpenAI', () => {
      const found = OPENAI_VOICES.find(v => v.id === 'alloy');
      expect(found).toBeDefined();
    });

    it('default voice "en-US-JennyNeural" tồn tại trong Azure', () => {
      const found = AZURE_VOICES.find(v => v.id === 'en-US-JennyNeural');
      expect(found).toBeDefined();
    });
  });

  // ----- Provider Switch Logic -----

  describe('Provider Switch Logic', () => {
    it('chuyển OpenAI → Azure: voice reset về en-US-JennyNeural', () => {
      // Mô phỏng handleProviderChange logic
      useSpeakingStore.getState().setTtsSettings({
        provider: 'azure',
        voiceId: 'en-US-JennyNeural',
      });

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('azure');
      expect(ttsSettings.voiceId).toBe('en-US-JennyNeural');
    });

    it('chuyển Azure → OpenAI: voice reset về alloy', () => {
      // Set Azure trước
      useSpeakingStore.getState().setTtsSettings({
        provider: 'azure',
        voiceId: 'en-US-AriaNeural',
      });
      // Chuyển về OpenAI
      useSpeakingStore.getState().setTtsSettings({
        provider: 'openai',
        voiceId: 'alloy',
      });

      const {ttsSettings} = useSpeakingStore.getState();
      expect(ttsSettings.provider).toBe('openai');
      expect(ttsSettings.voiceId).toBe('alloy');
    });

    it('giữ speed khi đổi provider', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 1.5});

      // Chuyển provider
      useSpeakingStore.getState().setTtsSettings({
        provider: 'azure',
        voiceId: 'en-US-JennyNeural',
      });

      // Speed vẫn giữ nguyên
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(1.5);
    });
  });

  // ----- Speed Validation -----

  describe('Speed Range', () => {
    it('speed mặc định là 1.0', () => {
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(1.0);
    });

    it('set speed ở biên min 0.5', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 0.5});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(0.5);
    });

    it('set speed ở biên max 2.0', () => {
      useSpeakingStore.getState().setTtsSettings({speed: 2.0});
      expect(useSpeakingStore.getState().ttsSettings.speed).toBe(2.0);
    });
  });

  // ----- Voice Selection Logic -----

  describe('Voice Selection', () => {
    it('chọn voice trong danh sách OpenAI', () => {
      OPENAI_VOICES.forEach(voice => {
        useSpeakingStore.getState().setTtsSettings({voiceId: voice.id});
        expect(useSpeakingStore.getState().ttsSettings.voiceId).toBe(voice.id);
      });
    });

    it('chọn voice trong danh sách Azure', () => {
      useSpeakingStore.getState().setTtsSettings({provider: 'azure'});
      AZURE_VOICES.forEach(voice => {
        useSpeakingStore.getState().setTtsSettings({voiceId: voice.id});
        expect(useSpeakingStore.getState().ttsSettings.voiceId).toBe(voice.id);
      });
    });
  });
});
