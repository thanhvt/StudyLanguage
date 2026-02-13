/**
 * Unit test cho useDictionary hook
 *
 * Mục đích: Test dictionary lookup qua backend API
 * Ref test cases:
 *   - MOB-LIS-MVP-HP-014: Tap từ → tra từ điển popup
 *   - MOB-LIS-MVP-EC-005: Tap từ khác khi popup đang mở
 */
import {renderHook, act, waitFor} from '@testing-library/react-native';
import {useDictionary} from '@/hooks/useDictionary';
import {apiClient} from '@/services/api/client';

// Mock apiClient
jest.mock('@/services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

describe('useDictionary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // MOB-LIS-MVP-HP-014: Tra từ thành công
  it('lookup tra từ thành công và cập nhật result', async () => {
    const mockResponse = {
      data: {
        success: true,
        result: {
          word: 'hello',
          ipa: '/həˈloʊ/',
          audio: 'https://example.com/hello.mp3',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'An utterance of "hello"; a greeting.',
                  example: 'She gave a cheery hello.',
                },
              ],
            },
          ],
        },
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const {result} = renderHook(() => useDictionary());

    // Trạng thái ban đầu
    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();

    // Gọi lookup
    await act(async () => {
      await result.current.lookup('Hello!');
    });

    // Kiểm tra API được gọi đúng
    expect(apiClient.get).toHaveBeenCalledWith('/dictionary/lookup', {
      params: {word: 'hello'},
    });

    // Kiểm tra result
    expect(result.current.result?.word).toBe('hello');
    expect(result.current.result?.ipa).toBe('/həˈloʊ/');
    expect(result.current.result?.audio).toBe(
      'https://example.com/hello.mp3',
    );
    expect(result.current.result?.meanings).toHaveLength(1);
    expect(result.current.result?.meanings[0].partOfSpeech).toBe('noun');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // Test loading state
  it('set isLoading = true khi đang tra từ', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    (apiClient.get as jest.Mock).mockReturnValue(promise);

    const {result} = renderHook(() => useDictionary());

    // Bắt đầu lookup — chưa resolve
    act(() => {
      result.current.lookup('test');
    });

    // Phải đang loading
    await waitFor(() => {
      expect(result.current.isLoading).toBe(true);
    });

    // Resolve promise
    await act(async () => {
      resolvePromise!({data: {result: {word: 'test', meanings: []}}});
    });

    expect(result.current.isLoading).toBe(false);
  });

  // Test error khi API 404
  it('set error khi API trả về 404', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce({
      response: {status: 404},
      message: 'Not Found',
    });

    const {result} = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.lookup('xyzabc');
    });

    expect(result.current.error).toContain('Không tìm thấy từ');
    expect(result.current.result).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // Test error khi network lỗi
  it('set error khi mất mạng', async () => {
    (apiClient.get as jest.Mock).mockRejectedValueOnce(
      new Error('Network Error'),
    );

    const {result} = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.lookup('test');
    });

    expect(result.current.error).toBe('Network Error');
    expect(result.current.result).toBeNull();
  });

  // Test clear() reset state
  it('clear() reset toàn bộ state', async () => {
    const mockResponse = {
      data: {result: {word: 'test', ipa: null, audio: null, meanings: []}},
    };
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const {result} = renderHook(() => useDictionary());

    // Tra từ xong
    await act(async () => {
      await result.current.lookup('test');
    });
    expect(result.current.result).not.toBeNull();

    // Clear
    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  // Test bỏ qua từ rỗng
  it('bỏ qua lookup khi word rỗng', async () => {
    const {result} = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.lookup('');
    });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
  });

  // Test clean special characters
  it('loại bỏ ký tự đặc biệt trước khi tra', async () => {
    const mockResponse = {
      data: {result: {word: 'don\'t', ipa: null, audio: null, meanings: []}},
    };
    (apiClient.get as jest.Mock).mockResolvedValueOnce(mockResponse);

    const {result} = renderHook(() => useDictionary());

    await act(async () => {
      await result.current.lookup('don\'t,');
    });

    // Dấu phẩy bị loại bỏ, nhưng dấu nháy giữ lại
    expect(apiClient.get).toHaveBeenCalledWith('/dictionary/lookup', {
      params: {word: "don't"},
    });
  });
});
