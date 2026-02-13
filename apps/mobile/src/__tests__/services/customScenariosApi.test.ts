/**
 * Unit test cho Custom Scenarios API service
 *
 * Mục đích: Test CRUD API calls cho Custom Scenarios (backend sync)
 * Ref test cases:
 *   - Sprint 3.2: Custom Scenarios Backend Sync
 */
import {customScenarioApi} from '@/services/api/customScenarios';
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

describe('customScenarioApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockScenario = {
    id: 'cs-1',
    name: 'Coffee Shop Ordering',
    description: 'Gọi đồ uống tại quán cà phê',
    category: 'daily',
    isFavorite: false,
    createdAt: '2026-02-14T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  };

  // ========================
  // list
  // ========================
  describe('list', () => {
    it('gọi GET /custom-scenarios', async () => {
      mockGet.mockResolvedValue({data: [mockScenario]} as any);

      const result = await customScenarioApi.list();

      expect(mockGet).toHaveBeenCalledWith('/custom-scenarios');
      expect(result).toEqual([mockScenario]);
    });

    it('trả về mảng rỗng khi không có scenarios', async () => {
      mockGet.mockResolvedValue({data: []} as any);

      const result = await customScenarioApi.list();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('trả về nhiều scenarios', async () => {
      const scenarios = [
        mockScenario,
        {...mockScenario, id: 'cs-2', name: 'Airport Check-in'},
      ];
      mockGet.mockResolvedValue({data: scenarios} as any);

      const result = await customScenarioApi.list();

      expect(result).toHaveLength(2);
    });
  });

  // ========================
  // create
  // ========================
  describe('create', () => {
    it('gọi POST /custom-scenarios với name và description', async () => {
      mockPost.mockResolvedValue({data: mockScenario} as any);

      await customScenarioApi.create({
        name: 'Coffee Shop Ordering',
        description: 'Gọi đồ uống tại quán cà phê',
      });

      expect(mockPost).toHaveBeenCalledWith('/custom-scenarios', {
        name: 'Coffee Shop Ordering',
        description: 'Gọi đồ uống tại quán cà phê',
      });
    });

    it('trả về scenario mới được tạo', async () => {
      mockPost.mockResolvedValue({data: mockScenario} as any);

      const result = await customScenarioApi.create({name: 'Test'});

      expect(result.id).toBe('cs-1');
      expect(result.name).toBe('Coffee Shop Ordering');
    });

    it('gửi category nếu có', async () => {
      mockPost.mockResolvedValue({data: mockScenario} as any);

      await customScenarioApi.create({
        name: 'Test',
        category: 'business',
      });

      expect(mockPost).toHaveBeenCalledWith('/custom-scenarios', {
        name: 'Test',
        category: 'business',
      });
    });
  });

  // ========================
  // toggleFavorite
  // ========================
  describe('toggleFavorite', () => {
    it('gọi PATCH /custom-scenarios/:id/favorite', async () => {
      const updated = {...mockScenario, isFavorite: true};
      mockPatch.mockResolvedValue({data: updated} as any);

      const result = await customScenarioApi.toggleFavorite('cs-1');

      expect(mockPatch).toHaveBeenCalledWith('/custom-scenarios/cs-1/favorite');
      expect(result.isFavorite).toBe(true);
    });
  });

  // ========================
  // delete
  // ========================
  describe('delete', () => {
    it('gọi DELETE /custom-scenarios/:id', async () => {
      mockDelete.mockResolvedValue({} as any);

      await customScenarioApi.delete('cs-1');

      expect(mockDelete).toHaveBeenCalledWith('/custom-scenarios/cs-1');
    });

    it('throw error khi xoá thất bại', async () => {
      mockDelete.mockRejectedValue(new Error('Not found'));

      await expect(customScenarioApi.delete('invalid')).rejects.toThrow(
        'Not found',
      );
    });
  });
});
