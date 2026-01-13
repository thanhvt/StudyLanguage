import { Test, TestingModule } from '@nestjs/testing';
import { ListenLaterService } from './listen-later.service';

/**
 * Unit Tests cho ListenLaterService
 *
 * Mục đích: Test các CRUD operations cho Listen Later
 * Coverage: getListenLater, addToListenLater, removeFromListenLater, clearListenLater
 */

// Mock Supabase client
const mockSupabaseFrom = jest.fn();
const mockSupabase = {
  from: mockSupabaseFrom,
};

// Mock createClient
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase),
}));

describe('ListenLaterService', () => {
  let service: ListenLaterService;
  const mockUserId = 'test-user-id-123';

  // Setup trước mỗi test
  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListenLaterService],
    }).compile();

    service = module.get<ListenLaterService>(ListenLaterService);
  });

  // ============================================
  // getListenLater Tests
  // ============================================

  describe('getListenLater', () => {
    it('nên trả về danh sách items và count', async () => {
      // Arrange
      const mockItems = [
        { id: '1', topic: 'Test Topic 1', user_id: mockUserId },
        { id: '2', topic: 'Test Topic 2', user_id: mockUserId },
      ];

      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: mockItems,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.getListenLater(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.items).toEqual(mockItems);
      expect(result.count).toBe(2);
      expect(mockSupabaseFrom).toHaveBeenCalledWith('listen_later');
    });

    it('nên trả về mảng rỗng khi không có items', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.getListenLater(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.items).toEqual([]);
      expect(result.count).toBe(0);
    });

    it('nên throw error khi Supabase trả về lỗi', async () => {
      // Arrange
      const mockError = { message: 'Database error' };
      mockSupabaseFrom.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.getListenLater(mockUserId)).rejects.toEqual(mockError);
    });
  });

  // ============================================
  // addToListenLater Tests
  // ============================================

  describe('addToListenLater', () => {
    const mockDto = {
      topic: 'Test Topic',
      conversation: [{ speaker: 'A', text: 'Hello' }],
      duration: 5,
      numSpeakers: 2,
      category: 'it',
      subCategory: 'Agile',
    };

    it('nên thêm item thành công', async () => {
      // Arrange
      const mockInsertedItem = {
        id: 'new-item-id',
        user_id: mockUserId,
        ...mockDto,
      };

      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockInsertedItem,
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.addToListenLater(mockUserId, mockDto);

      // Assert
      expect(result.success).toBe(true);
      expect(result.item).toEqual(mockInsertedItem);
    });

    it('nên throw error khi insert thất bại', async () => {
      // Arrange
      const mockError = { message: 'Insert failed' };
      mockSupabaseFrom.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError,
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.addToListenLater(mockUserId, mockDto)).rejects.toEqual(mockError);
    });
  });

  // ============================================
  // removeFromListenLater Tests
  // ============================================

  describe('removeFromListenLater', () => {
    const mockItemId = 'item-to-delete';

    it('nên xóa item thành công', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: null,
            }),
          }),
        }),
      });

      // Act
      const result = await service.removeFromListenLater(mockUserId, mockItemId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã xóa khỏi danh sách Nghe Sau');
    });

    it('nên throw error khi delete thất bại', async () => {
      // Arrange
      const mockError = { message: 'Delete failed' };
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              error: mockError,
            }),
          }),
        }),
      });

      // Act & Assert
      await expect(service.removeFromListenLater(mockUserId, mockItemId)).rejects.toEqual(mockError);
    });
  });

  // ============================================
  // clearListenLater Tests
  // ============================================

  describe('clearListenLater', () => {
    it('nên xóa tất cả items thành công', async () => {
      // Arrange
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      // Act
      const result = await service.clearListenLater(mockUserId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Đã xóa tất cả khỏi danh sách Nghe Sau');
    });

    it('nên throw error khi clear thất bại', async () => {
      // Arrange
      const mockError = { message: 'Clear failed' };
      mockSupabaseFrom.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            error: mockError,
          }),
        }),
      });

      // Act & Assert
      await expect(service.clearListenLater(mockUserId)).rejects.toEqual(mockError);
    });
  });
});
