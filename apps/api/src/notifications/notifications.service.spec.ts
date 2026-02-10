import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  })),
}));

describe('NotificationsService', () => {
  let service: NotificationsService;
  let supabase: any;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    supabase = (service as any).supabase;
  });

  it('nên được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('registerDevice', () => {
    it('nên đăng ký device token thành công', async () => {
      // Arrange
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({ error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.registerDevice(
        'user-123',
        'fcm-token-abc123',
        'ios',
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Đã đăng ký');
    });

    it('nên throw InternalServerErrorException khi DB lỗi', async () => {
      // Arrange
      const mockQuery = {
        upsert: jest.fn().mockResolvedValue({
          error: { message: 'DB error' },
        }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act & Assert
      await expect(
        service.registerDevice('user-123', 'token', 'ios'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('sendNotification', () => {
    it('nên trả về thông tin devices khi gửi notification', async () => {
      // Arrange
      const mockTokens = [
        { token: 'fcm-token-1234567890', platform: 'ios' },
        { token: 'fcm-token-abcdefghij', platform: 'android' },
      ];

      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: mockTokens, error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.sendNotification('user-123', {
        title: 'Nhắc nhở học bài',
        body: 'Streak của bạn đang 🔥!',
      });

      // Assert
      expect(result.success).toBe(true);
      expect(result.sent).toBe(2);
    });

    it('nên trả về sent=0 khi không có device nào', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.sendNotification('user-123', {
        title: 'Test',
        body: 'Test',
      });

      // Assert
      expect(result.success).toBe(false);
      expect(result.sent).toBe(0);
    });

    it('nên throw khi DB lỗi', async () => {
      // Arrange
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      };
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act & Assert
      await expect(
        service.sendNotification('user-123', { title: 'T', body: 'B' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('unregisterDevice', () => {
    it('nên xóa device token thành công', async () => {
      // Arrange
      const mockQuery = {
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      mockQuery.eq = jest.fn()
        .mockReturnValueOnce(mockQuery)
        .mockResolvedValueOnce({ error: null });
      mockQuery.delete = jest.fn().mockReturnValue(mockQuery);
      supabase.from = jest.fn().mockReturnValue(mockQuery);

      // Act
      const result = await service.unregisterDevice('user-123', 'token-abc');

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toContain('Đã xóa');
    });
  });
});
