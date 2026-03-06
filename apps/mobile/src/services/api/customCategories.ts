import {apiClient} from './client';

// =======================
// Types cho Custom Categories API
// =======================

/** Custom category từ server */
export interface CustomCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  scenarioCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Response từ GET /custom-categories */
export interface CategoriesListResponse {
  success: boolean;
  categories: CustomCategory[];
  otherCount: number;
  count: number;
  maxCategories: number;
}

// =======================
// Custom Categories API Service
// =======================

/**
 * Mục đích: Service gọi API backend cho Custom Categories
 * Tham số đầu vào: auth token (auto qua apiClient)
 * Tham số đầu ra: CustomCategory objects
 * Khi nào sử dụng:
 *   - TopicPicker mount → list() để load tabs
 *   - CreateCategorySheet → create() để tạo nhóm mới
 *   - ManageCategoriesScreen → update()/delete() để quản lý
 */
export const customCategoryApi = {
  /**
   * Mục đích: Lấy danh sách custom categories
   * Tham số đầu vào: không
   * Tham số đầu ra: Promise<CategoriesListResponse>
   * Khi nào sử dụng: TopicPicker mount hoặc refresh
   */
  list: async (): Promise<CategoriesListResponse> => {
    console.log('📂 [CustomCategory] Lấy danh sách...');
    const response = await apiClient.get('/custom-categories');
    return response.data as CategoriesListResponse;
  },

  /**
   * Mục đích: Tạo custom category mới + optional batch scenarios
   * Tham số đầu vào: name, icon, description, scenarioNames (optional)
   * Tham số đầu ra: Promise<{ success: boolean; category: CustomCategory }>
   * Khi nào sử dụng: User nhấn "✅ Tạo nhóm" trong CreateCategorySheet
   */
  create: async (data: {
    name: string;
    icon?: string;
    description?: string;
    scenarioNames?: string[];
  }): Promise<{success: boolean; category: CustomCategory}> => {
    console.log('📂 [CustomCategory] Tạo mới:', data.name);
    const response = await apiClient.post('/custom-categories', data);
    return response.data as {success: boolean; category: CustomCategory};
  },

  /**
   * Mục đích: Cập nhật thông tin category
   * Tham số đầu vào: id, data (name?, icon?, description?)
   * Tham số đầu ra: Promise<{ success: boolean; category: CustomCategory }>
   * Khi nào sử dụng: User sửa trong Settings > ManageCategories
   */
  update: async (
    id: string,
    data: {name?: string; icon?: string; description?: string},
  ): Promise<{success: boolean; category: CustomCategory}> => {
    console.log('📂 [CustomCategory] Cập nhật:', id);
    const response = await apiClient.patch(`/custom-categories/${id}`, data);
    return response.data as {success: boolean; category: CustomCategory};
  },

  /**
   * Mục đích: Xoá category + xử lý scenarios bên trong
   * Tham số đầu vào: id, keepScenarios (default true)
   * Tham số đầu ra: Promise<{ success: boolean; message: string; movedScenarios?: number }>
   * Khi nào sử dụng: User xoá nhóm trong Settings
   *   - keepScenarios=true → chuyển scenarios vào Other
   *   - keepScenarios=false → cascade delete
   */
  delete: async (
    id: string,
    keepScenarios: boolean = true,
  ): Promise<{success: boolean; message: string; movedScenarios?: number}> => {
    console.log('📂 [CustomCategory] Xoá:', id, 'keepScenarios:', keepScenarios);
    const response = await apiClient.delete(
      `/custom-categories/${id}?keepScenarios=${keepScenarios}`,
    );
    return response.data as {
      success: boolean;
      message: string;
      movedScenarios?: number;
    };
  },
};
