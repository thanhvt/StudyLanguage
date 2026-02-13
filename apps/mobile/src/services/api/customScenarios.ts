import {apiClient} from './client';

// =======================
// Types cho Custom Scenarios API
// =======================

/** Custom scenario từ server */
export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  category?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// =======================
// Custom Scenarios API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Custom Scenarios
 * Tham số đầu vào: auth token (auto qua apiClient)
 * Tham số đầu ra: CustomScenario objects
 * Khi nào sử dụng: CustomScenarioInput → CRUD operations
 *   - list: Load danh sách khi mở component
 *   - create: User tạo scenario mới + "Lưu lại"
 *   - update: Sửa tên/description
 *   - toggleFavorite: Toggle ⭐
 *   - delete: Xoá scenario
 */
export const customScenarioApi = {
  /**
   * Mục đích: Lấy danh sách custom scenarios
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<CustomScenario[]>
   * Khi nào sử dụng: Component mount hoặc refresh
   */
  list: async (): Promise<CustomScenario[]> => {
    console.log('📝 [CustomScenario] Lấy danh sách...');
    const response = await apiClient.get('/custom-scenarios');
    return response.data as CustomScenario[];
  },

  /**
   * Mục đích: Tạo custom scenario mới
   * Tham số đầu vào: name, description (optional), category (optional)
   * Tham số đầu ra: Promise<CustomScenario>
   * Khi nào sử dụng: User nhấn "Lưu lại" trong form
   */
  create: async (data: {
    name: string;
    description?: string;
    category?: string;
  }): Promise<CustomScenario> => {
    console.log('📝 [CustomScenario] Tạo mới:', data.name);
    const response = await apiClient.post('/custom-scenarios', data);
    return response.data as CustomScenario;
  },

  /**
   * Mục đích: Toggle trạng thái favorite
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: Promise<CustomScenario>
   * Khi nào sử dụng: User nhấn ⭐ trên scenario
   */
  toggleFavorite: async (id: string): Promise<CustomScenario> => {
    console.log('📝 [CustomScenario] Toggle favorite:', id);
    const response = await apiClient.patch(`/custom-scenarios/${id}/favorite`);
    return response.data as CustomScenario;
  },

  /**
   * Mục đích: Xoá custom scenario
   * Tham số đầu vào: id (string)
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: User nhấn 🗑️ trên scenario
   */
  delete: async (id: string): Promise<void> => {
    console.log('📝 [CustomScenario] Xoá:', id);
    await apiClient.delete(`/custom-scenarios/${id}`);
  },
};
