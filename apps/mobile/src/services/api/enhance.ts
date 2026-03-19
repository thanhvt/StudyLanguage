import {apiClient} from './client';

/**
 * Mục đích: Service gọi API backend để enhance scenario (mở rộng keyword → scenario đầy đủ)
 * Tham số đầu vào: không (singleton object)
 * Tham số đầu ra: enhanceApi object với method enhanceScenario
 * Khi nào sử dụng:
 *   - TopicSelector → user nhập keyword ngắn → bấm ✨ → gọi enhanceScenario
 *   - Được dùng ở tất cả 4 config screens
 */
export const enhanceApi = {
  /**
   * Mục đích: Gọi API mở rộng keyword thành scenario 12-16 từ
   * Tham số đầu vào:
   *   - shortInput (string): keyword hoặc cụm từ ngắn (VD: "interview ui ux")
   *   - context (string?): loại screen đang dùng (VD: "conversation_roleplay")
   * Tham số đầu ra: Promise<string> — scenario đầy đủ
   * Khi nào sử dụng:
   *   - ConfigScreen → handleEnhanceScenario → enhanceApi.enhanceScenario()
   *   - ConversationSetupScreen → handleEnhanceScenario → enhanceApi.enhanceScenario()
   *   - ShadowingConfigScreen → handleEnhanceScenario → enhanceApi.enhanceScenario()
   *   - Listening ConfigScreen → handleEnhanceScenario → enhanceApi.enhanceScenario()
   */
  enhanceScenario: async (
    shortInput: string,
    context?: string,
  ): Promise<string> => {
    console.log('✨ [Enhance] Đang enhance scenario:', shortInput, '| context:', context);

    const response = await apiClient.post(
      '/ai/enhance-scenario',
      {
        shortInput,
        ...(context && {context}),
      },
      {timeout: 15000}, // 15s — task nhẹ, không cần 60s
    );

    const enhanced = response.data?.enhanced || shortInput;
    console.log('✅ [Enhance] Kết quả:', enhanced);
    return enhanced;
  },
};
