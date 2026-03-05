/**
 * Smoke Tests cho Radio Mode — Critical Paths
 *
 * Mục đích: Verify các flow quan trọng nhất hoạt động đúng
 * Tham số đầu vào: không
 * Tham số đầu ra: Test results
 * Khi nào sử dụng: CI/CD — smoke test trước mỗi release
 */

jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn().mockReturnValue(null),
    delete: jest.fn(),
  })),
}));

jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import {radioApi} from '@/services/api/radio';
import {useRadioStore} from '@/store/useRadioStore';
import {apiClient} from '@/services/api/client';

const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockDelete = (apiClient as any).delete as jest.MockedFunction<any>;

describe('Radio Mode — Smoke Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRadioStore.getState().reset();
    useRadioStore.setState({
      playbackSpeed: 1,
      shuffle: false,
      repeat: 'off',
      preferredCategories: [],
      totalListenedSeconds: 0,
      streak: 0,
      lastListenedDate: null,
      trackProgress: {},
    });
  });

  // ========================
  // Smoke: Generate và display playlist
  // ========================
  describe('SMOKE: Generate playlist flow', () => {
    it('gọi API generate → nhận playlist → lưu vào store', async () => {
      const mockResult = {
        playlist: {id: 'pl-1', name: 'Test', description: 'Mô tả', duration: 30, trackCount: 2},
        items: [
          {id: 'item-1', topic: 'Topic 1', conversation: [], duration: 15, numSpeakers: 2, category: 'it', subCategory: 'Dev', position: 0},
          {id: 'item-2', topic: 'Topic 2', conversation: [], duration: 15, numSpeakers: 3, category: 'daily', subCategory: 'Life', position: 1},
        ],
      };
      mockPost.mockResolvedValue({data: {data: mockResult}} as any);

      // 1. Gọi API
      const result = await radioApi.generate(30);
      expect(result.playlist.trackCount).toBe(2);
      expect(result.items).toHaveLength(2);

      // 2. Lưu vào store
      useRadioStore.getState().setCurrentPlaylist(result);
      expect(useRadioStore.getState().currentPlaylist?.playlist.id).toBe('pl-1');
    });
  });

  // ========================
  // Smoke: Playlist history flow
  // ========================
  describe('SMOKE: Playlist history', () => {
    it('fetch playlists → hiện danh sách → load detail', async () => {
      // Fetch list
      const mockList = [{id: 'pl-1', name: 'Mix 1', description: '', created_at: '2026-01-01', updated_at: '2026-01-01', itemCount: 5}];
      mockGet.mockResolvedValueOnce({data: {playlists: mockList}} as any);

      const playlists = await radioApi.getPlaylists();
      expect(playlists).toHaveLength(1);

      // Load detail
      const mockDetail = {id: 'pl-1', name: 'Mix 1', description: '', items: [{id: 'i1', topic: 'Test'}]};
      mockGet.mockResolvedValueOnce({data: {playlist: mockDetail}} as any);

      const detail = await radioApi.getPlaylistById('pl-1');
      expect(detail.items).toHaveLength(1);
    });
  });

  // ========================
  // Smoke: Playback controls
  // ========================
  describe('SMOKE: Playback controls', () => {
    it('next → previous → shuffle → repeat cycle', () => {
      const playlist = {
        playlist: {id: 'pl', name: 'Test', description: '', duration: 30, trackCount: 3},
        items: [
          {id: '1', topic: 'A', conversation: [], duration: 10, numSpeakers: 2, category: 'it', subCategory: '', position: 0},
          {id: '2', topic: 'B', conversation: [], duration: 10, numSpeakers: 2, category: 'it', subCategory: '', position: 1},
          {id: '3', topic: 'C', conversation: [], duration: 10, numSpeakers: 2, category: 'it', subCategory: '', position: 2},
        ],
      };

      useRadioStore.getState().setCurrentPlaylist(playlist);
      useRadioStore.getState().setCurrentTrackIndex(0);

      // Next → 1
      const next = useRadioStore.getState().nextTrack();
      expect(next).toBe(1);

      // Previous → 0
      const prev = useRadioStore.getState().previousTrack();
      expect(prev).toBe(0);

      // Shuffle on
      useRadioStore.getState().toggleShuffle();
      expect(useRadioStore.getState().shuffle).toBe(true);

      // Repeat cycle
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('all');
      useRadioStore.getState().cycleRepeat();
      expect(useRadioStore.getState().repeat).toBe('one');
    });
  });

  // ========================
  // Smoke: Delete playlist
  // ========================
  describe('SMOKE: Delete playlist', () => {
    it('gọi DELETE API thành công', async () => {
      mockDelete.mockResolvedValue({data: {success: true}} as any);
      await radioApi.deletePlaylist('pl-1');
      expect(mockDelete).toHaveBeenCalledWith('/playlists/pl-1');
    });
  });
});
