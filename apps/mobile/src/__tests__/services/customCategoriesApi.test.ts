/**
 * Unit test cho Custom Categories API service
 *
 * Mục đích: Test CRUD API calls cho Custom Categories
 * Tham số đầu vào: Mock apiClient responses
 * Tham số đầu ra: Test pass/fail
 * Khi nào sử dụng: CI/CD pipeline, manual verification
 */
import {customCategoryApi} from '@/services/api/customCategories';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockGet = apiClient.get as jest.MockedFunction<typeof apiClient.get>;
const mockPost = apiClient.post as jest.MockedFunction<typeof apiClient.post>;
const mockPatch = apiClient.patch as jest.MockedFunction<typeof apiClient.patch>;
const mockDelete = apiClient.delete as jest.MockedFunction<typeof apiClient.delete>;

describe('customCategoryApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategory = {
    id: 'cat-1',
    name: 'Business English',
    icon: '💼',
    description: '',
    scenarioCount: 3,
    createdAt: '2026-03-06T00:00:00Z',
    updatedAt: '2026-03-06T00:00:00Z',
  };

  // ========================
  // list
  // ========================
  describe('list', () => {
    it('gọi GET /custom-categories và trả về đầy đủ response', async () => {
      const mockResponse = {
        data: {
          success: true,
          categories: [mockCategory],
          otherCount: 5,
          count: 1,
          maxCategories: 10,
        },
      };
      mockGet.mockResolvedValue(mockResponse as any);

      const result = await customCategoryApi.list();

      expect(mockGet).toHaveBeenCalledWith('/custom-categories');
      expect(result.success).toBe(true);
      expect(result.categories).toHaveLength(1);
      expect(result.categories[0].name).toBe('Business English');
      expect(result.otherCount).toBe(5);
      expect(result.maxCategories).toBe(10);
    });

    it('trả về mảng rỗng khi không có categories', async () => {
      mockGet.mockResolvedValue({
        data: {success: true, categories: [], otherCount: 0, count: 0, maxCategories: 10},
      } as any);

      const result = await customCategoryApi.list();

      expect(result.categories).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  // ========================
  // create
  // ========================
  describe('create', () => {
    it('gọi POST /custom-categories với name + icon', async () => {
      mockPost.mockResolvedValue({
        data: {success: true, category: mockCategory},
      } as any);

      const result = await customCategoryApi.create({
        name: 'Business English',
        icon: '💼',
      });

      expect(mockPost).toHaveBeenCalledWith('/custom-categories', {
        name: 'Business English',
        icon: '💼',
      });
      expect(result.success).toBe(true);
      expect(result.category.id).toBe('cat-1');
    });

    it('gửi scenarioNames nếu có', async () => {
      mockPost.mockResolvedValue({
        data: {success: true, category: {...mockCategory, scenarioCount: 2}},
      } as any);

      const data = {
        name: 'Travel',
        icon: '✈️',
        scenarioNames: ['Airport', 'Hotel Check-in'],
      };

      const result = await customCategoryApi.create(data);

      expect(mockPost).toHaveBeenCalledWith('/custom-categories', data);
      expect(result.category.scenarioCount).toBe(2);
    });

    it('throw error khi đạt giới hạn 10', async () => {
      mockPost.mockRejectedValue({
        response: {data: {message: 'Đã đạt giới hạn 10 nhóm.'}},
      });

      await expect(
        customCategoryApi.create({name: 'Overflow'}),
      ).rejects.toBeDefined();
    });

    it('throw error khi tên trùng', async () => {
      mockPost.mockRejectedValue({
        response: {data: {message: 'Tên nhóm "Business English" đã tồn tại.'}},
      });

      await expect(
        customCategoryApi.create({name: 'Business English'}),
      ).rejects.toBeDefined();
    });
  });

  // ========================
  // update
  // ========================
  describe('update', () => {
    it('gọi PATCH /custom-categories/:id với data update', async () => {
      const updated = {...mockCategory, name: 'Updated Name', icon: '🎯'};
      mockPatch.mockResolvedValue({
        data: {success: true, category: updated},
      } as any);

      const result = await customCategoryApi.update('cat-1', {
        name: 'Updated Name',
        icon: '🎯',
      });

      expect(mockPatch).toHaveBeenCalledWith('/custom-categories/cat-1', {
        name: 'Updated Name',
        icon: '🎯',
      });
      expect(result.category.name).toBe('Updated Name');
    });

    it('chỉ gửi fields cần update', async () => {
      mockPatch.mockResolvedValue({
        data: {success: true, category: {...mockCategory, icon: '🎮'}},
      } as any);

      await customCategoryApi.update('cat-1', {icon: '🎮'});

      expect(mockPatch).toHaveBeenCalledWith('/custom-categories/cat-1', {
        icon: '🎮',
      });
    });
  });

  // ========================
  // delete
  // ========================
  describe('delete', () => {
    it('gọi DELETE với keepScenarios=true (mặc định)', async () => {
      mockDelete.mockResolvedValue({
        data: {success: true, message: 'Đã xoá', movedScenarios: 3},
      } as any);

      const result = await customCategoryApi.delete('cat-1');

      expect(mockDelete).toHaveBeenCalledWith(
        '/custom-categories/cat-1?keepScenarios=true',
      );
      expect(result.success).toBe(true);
      expect(result.movedScenarios).toBe(3);
    });

    it('gọi DELETE với keepScenarios=false', async () => {
      mockDelete.mockResolvedValue({
        data: {success: true, message: 'Đã xoá tất cả', movedScenarios: 0},
      } as any);

      const result = await customCategoryApi.delete('cat-1', false);

      expect(mockDelete).toHaveBeenCalledWith(
        '/custom-categories/cat-1?keepScenarios=false',
      );
      expect(result.movedScenarios).toBe(0);
    });

    it('throw error khi category không tồn tại', async () => {
      mockDelete.mockRejectedValue(new Error('Not found'));

      await expect(
        customCategoryApi.delete('invalid-id'),
      ).rejects.toThrow('Not found');
    });
  });
});
