import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ListenLaterController } from './listen-later.controller';
import { ListenLaterService } from './listen-later.service';
import { ConfigService } from '@nestjs/config';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';

/**
 * Unit Tests cho ListenLaterController
 *
 * Mục đích: Test các API endpoints cho Listen Later
 * Coverage: GET, POST, DELETE endpoints
 */

// Mock Service
const mockListenLaterService = {
  getListenLater: jest.fn(),
  addToListenLater: jest.fn(),
  removeFromListenLater: jest.fn(),
  clearListenLater: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockReturnValue('http://mock-url.com'),
};

// Mock AuthGuard để bypass authentication
const mockAuthGuard = {
  canActivate: jest.fn().mockReturnValue(true),
};

describe('ListenLaterController', () => {
  let controller: ListenLaterController;
  const mockUserId = 'test-user-id-123';

  // Mock request với user
  const mockRequest = {
    user: { id: mockUserId },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListenLaterController],
      providers: [
        {
          provide: ListenLaterService,
          useValue: mockListenLaterService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    })
      .overrideGuard(SupabaseAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<ListenLaterController>(ListenLaterController);
  });

  // ============================================
  // GET /listen-later Tests
  // ============================================

  describe('GET /listen-later', () => {
    it('nên trả về danh sách items', async () => {
      // Arrange
      const mockResult = {
        success: true,
        items: [{ id: '1', topic: 'Test' }],
        count: 1,
      };
      mockListenLaterService.getListenLater.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getListenLater(mockRequest);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockListenLaterService.getListenLater).toHaveBeenCalledWith(mockUserId);
    });

    it('nên throw HttpException khi không có user', async () => {
      // Arrange
      const requestWithoutUser = { user: null };

      // Act & Assert
      await expect(controller.getListenLater(requestWithoutUser)).rejects.toThrow(HttpException);
    });

    it('nên throw HttpException khi service lỗi', async () => {
      // Arrange
      mockListenLaterService.getListenLater.mockRejectedValue(new Error('Service error'));

      // Act & Assert
      await expect(controller.getListenLater(mockRequest)).rejects.toThrow(HttpException);
    });
  });

  // ============================================
  // POST /listen-later Tests
  // ============================================

  describe('POST /listen-later', () => {
    const mockDto = {
      topic: 'Test Topic',
      conversation: [{ speaker: 'A', text: 'Hello' }],
      duration: 5,
      numSpeakers: 2,
    };

    it('nên thêm item thành công', async () => {
      // Arrange
      const mockResult = {
        success: true,
        item: { id: 'new-id', ...mockDto },
      };
      mockListenLaterService.addToListenLater.mockResolvedValue(mockResult);

      // Act
      const result = await controller.addToListenLater(mockRequest, mockDto);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockListenLaterService.addToListenLater).toHaveBeenCalledWith(mockUserId, mockDto);
    });

    it('nên throw HttpException khi không có user', async () => {
      // Arrange
      const requestWithoutUser = { user: null };

      // Act & Assert
      await expect(controller.addToListenLater(requestWithoutUser, mockDto)).rejects.toThrow(HttpException);
    });
  });

  // ============================================
  // DELETE /listen-later/:id Tests
  // ============================================

  describe('DELETE /listen-later/:id', () => {
    const mockItemId = 'item-to-delete';

    it('nên xóa item thành công', async () => {
      // Arrange
      const mockResult = { success: true, message: 'Đã xóa' };
      mockListenLaterService.removeFromListenLater.mockResolvedValue(mockResult);

      // Act
      const result = await controller.removeFromListenLater(mockRequest, mockItemId);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockListenLaterService.removeFromListenLater).toHaveBeenCalledWith(mockUserId, mockItemId);
    });

    it('nên throw HttpException khi không có user', async () => {
      // Arrange
      const requestWithoutUser = { user: null };

      // Act & Assert
      await expect(controller.removeFromListenLater(requestWithoutUser, mockItemId)).rejects.toThrow(HttpException);
    });
  });

  // ============================================
  // DELETE /listen-later Tests (Clear All)
  // ============================================

  describe('DELETE /listen-later (clear all)', () => {
    it('nên xóa tất cả items thành công', async () => {
      // Arrange
      const mockResult = { success: true, message: 'Đã xóa tất cả' };
      mockListenLaterService.clearListenLater.mockResolvedValue(mockResult);

      // Act
      const result = await controller.clearListenLater(mockRequest);

      // Assert
      expect(result).toEqual(mockResult);
      expect(mockListenLaterService.clearListenLater).toHaveBeenCalledWith(mockUserId);
    });
  });
});
