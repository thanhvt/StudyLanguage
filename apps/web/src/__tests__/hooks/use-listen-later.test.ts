/**
 * Unit Tests cho useListenLater hook
 *
 * Mục đích: Test các operations của hook Listen Later
 * Coverage: fetchListenLater, addToListenLater, removeFromListenLater, clearAll
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useListenLater } from '@/hooks/use-listen-later';

// Mock API
const mockApi = jest.fn();
jest.mock('@/lib/api', () => ({
  api: (...args: unknown[]) => mockApi(...args),
}));

describe('useListenLater', () => {
  const mockItems = [
    {
      id: '1',
      topic: 'Test Topic 1',
      conversation: [{ speaker: 'A', text: 'Hello' }],
      duration: 5,
      num_speakers: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      topic: 'Test Topic 2',
      conversation: [{ speaker: 'B', text: 'Hi' }],
      duration: 10,
      num_speakers: 3,
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock response for initial fetch
    mockApi.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ items: mockItems, count: 2 }),
    });
  });

  // ============================================
  // Initial Fetch Tests
  // ============================================

  describe('initial fetch', () => {
    it('nên fetch danh sách khi mount', async () => {
      // Act
      const { result } = renderHook(() => useListenLater());

      // Assert - initial state
      expect(result.current.isLoading).toBe(true);

      // Wait for fetch to complete
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toEqual(mockItems);
      expect(result.current.count).toBe(2);
      expect(mockApi).toHaveBeenCalledWith('/listen-later');
    });

    it('nên set error khi fetch thất bại', async () => {
      // Arrange
      mockApi.mockResolvedValue({
        ok: false,
        json: jest.fn(),
      });

      // Act
      const { result } = renderHook(() => useListenLater());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Assert
      expect(result.current.error).not.toBeNull();
      expect(result.current.items).toEqual([]);
    });
  });

  // ============================================
  // addToListenLater Tests
  // ============================================

  describe('addToListenLater', () => {
    const newItemDto = {
      topic: 'New Topic',
      conversation: [{ speaker: 'C', text: 'New message' }],
      duration: 15,
      numSpeakers: 4,
    };

    it('nên thêm item thành công', async () => {
      // Arrange
      const newItem = { id: '3', ...newItemDto, created_at: new Date().toISOString() };
      
      // Initial fetch mock
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ items: mockItems, count: 2 }),
      });

      const { result } = renderHook(() => useListenLater());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock POST request
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ item: newItem }),
      });

      // Act
      let addedItem;
      await act(async () => {
        addedItem = await result.current.addToListenLater(newItemDto);
      });

      // Assert
      expect(addedItem).toEqual(newItem);
      expect(result.current.count).toBe(3);
      expect(result.current.items).toContainEqual(newItem);
    });

    it('nên trả về null khi thêm thất bại', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ items: [], count: 0 }),
      });

      const { result } = renderHook(() => useListenLater());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock failed POST
      mockApi.mockResolvedValueOnce({
        ok: false,
        json: jest.fn(),
      });

      // Act
      let addedItem;
      await act(async () => {
        addedItem = await result.current.addToListenLater(newItemDto);
      });

      // Assert
      expect(addedItem).toBeNull();
      expect(result.current.error).not.toBeNull();
    });
  });

  // ============================================
  // removeFromListenLater Tests
  // ============================================

  describe('removeFromListenLater', () => {
    it('nên xóa item thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ items: mockItems, count: 2 }),
      });

      const { result } = renderHook(() => useListenLater());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.items).toHaveLength(2);

      // Mock DELETE request
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      let success;
      await act(async () => {
        success = await result.current.removeFromListenLater('1');
      });

      // Assert
      expect(success).toBe(true);
      expect(result.current.count).toBe(1);
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items.find((i) => i.id === '1')).toBeUndefined();
    });
  });

  // ============================================
  // clearAll Tests
  // ============================================

  describe('clearAll', () => {
    it('nên xóa tất cả items thành công', async () => {
      // Initial fetch
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ items: mockItems, count: 2 }),
      });

      const { result } = renderHook(() => useListenLater());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock DELETE ALL request
      mockApi.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      // Act
      let success;
      await act(async () => {
        success = await result.current.clearAll();
      });

      // Assert
      expect(success).toBe(true);
      expect(result.current.count).toBe(0);
      expect(result.current.items).toEqual([]);
    });
  });
});
