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
  /** ID nhóm chủ đề (custom_categories.id). null = Other */
  categoryId: string | null;
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
   * Tham số đầu vào: categoryId (optional) — lọc theo nhóm, null = Other
   * Tham số đầu ra: Promise<CustomScenario[]>
   * Khi nào sử dụng: Component mount hoặc chuyển tab category
   */
  list: async (categoryId?: string | null): Promise<CustomScenario[]> => {
    console.log('📝 [CustomScenario] Lấy danh sách...', categoryId ? `category: ${categoryId}` : 'all');
    const params = categoryId !== undefined ? `?categoryId=${categoryId}` : '';
    const response = await apiClient.get(`/custom-scenarios${params}`);
    // Backend trả { success, scenarios, count } → cần lấy .scenarios
    const data = response.data as any;
    return (data?.scenarios ?? data ?? []) as CustomScenario[];
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
    categoryId?: string;
  }): Promise<CustomScenario> => {
    console.log('📝 [CustomScenario] Tạo mới:', data.name, 'nhóm:', data.categoryId || 'Other');
    const response = await apiClient.post('/custom-scenarios', data);
    // Backend trả { success, scenario } → lấy .scenario
    const result = response.data as any;
    return (result?.scenario ?? result) as CustomScenario;
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
    // Backend trả { success, isFavorite, message } → không phải scenario đầy đủ
    // Cần trả về scenario data từ response hoặc refetch
    const result = response.data as any;
    return result as CustomScenario;
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

  /**
   * Mục đích: Di chuyển scenario sang category khác
   * Tham số đầu vào: id, targetCategoryId (null = Other)
   * Tham số đầu ra: Promise<CustomScenario>
   * Khi nào sử dụng: ManageScenariosSheet > "Di chuyển nhóm"
   */
  move: async (
    id: string,
    targetCategoryId: string | null,
  ): Promise<CustomScenario> => {
    console.log('📝 [CustomScenario] Di chuyển:', id, '→', targetCategoryId || 'Other');
    const response = await apiClient.patch(`/custom-scenarios/${id}`, {
      categoryId: targetCategoryId,
    });
    const result = response.data as any;
    return (result?.scenario ?? result) as CustomScenario;
  },

  /**
   * Mục đích: Cập nhật tên và mô tả cho scenario
   * Tham số đầu vào: id (string), data (name, description)
   * Tham số đầu ra: Promise<CustomScenario>
   * Khi nào sử dụng: ManageCategoriesScreen > "✏️ Sửa tên & mô tả"
   */
  update: async (
    id: string,
    data: { name?: string; description?: string },
  ): Promise<CustomScenario> => {
    console.log('📝 [CustomScenario] Cập nhật:', id, data);
    const response = await apiClient.patch(`/custom-scenarios/${id}`, data);
    const result = response.data as any;
    return (result?.scenario ?? result) as CustomScenario;
  },
};
