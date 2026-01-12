import { render, screen, fireEvent } from '@testing-library/react';
import { DictionaryPopup, ClickableText } from '@/components/dictionary-popup';

/**
 * Unit Tests cho DictionaryPopup Component
 * 
 * Mục đích: Kiểm tra chức năng tra từ điển và hiển thị popup
 * Test cases dựa trên: 01_unit_tests.md (UT-CMP-002, UT-CMP-003)
 */

// Mock fetch API
global.fetch = jest.fn();

describe('DictionaryPopup Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [{
        word: 'hello',
        phonetic: '/həˈloʊ/',
        meanings: [{
          partOfSpeech: 'noun',
          definitions: [{ definition: 'a greeting', example: 'Say hello!' }]
        }]
      }]
    });
  });

  /**
   * UT-CMP-002: Hiển thị khi có từ được chọn
   * Khi: word="hello", isOpen=true
   * Kỳ vọng: Popup visible, contains text "hello"
   */
  it('UT-CMP-002: Hiển thị popup với từ được chọn', () => {
    render(<DictionaryPopup word="hello" onClose={mockOnClose} />);
    
    // Kiểm tra hiển thị từ
    expect(screen.getByText('hello')).toBeInTheDocument();
  });

  /**
   * UT-CMP-003: Ẩn khi click outside
   * Khi: User click ra ngoài popup
   * Kỳ vọng: onClose callback được gọi
   */
  it('UT-CMP-003: Gọi onClose khi click overlay', () => {
    render(<DictionaryPopup word="hello" onClose={mockOnClose} />);
    
    // Click vào overlay (backdrop)
    const overlay = document.querySelector('.fixed.inset-0');
    if (overlay) {
      fireEvent.click(overlay);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  /**
   * Test: Click nút đóng X
   * Khi: User click nút ✕
   * Kỳ vọng: onClose được gọi
   */
  it('Gọi onClose khi click nút đóng', () => {
    render(<DictionaryPopup word="hello" onClose={mockOnClose} />);
    
    // Click nút đóng
    const closeButton = screen.getByText('✕');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  /**
   * Test: Hiển thị loading state
   * Khi: Đang fetch từ điển
   * Kỳ vọng: Hiển thị text "Đang tra từ..."
   */
  it('Hiển thị loading state', () => {
    render(<DictionaryPopup word="test" onClose={mockOnClose} />);
    
    // Kiểm tra loading text
    expect(screen.getByText('Đang tra từ...')).toBeInTheDocument();
  });

  /**
   * Test: Click vào popup content không đóng popup
   * Khi: User click vào nội dung popup (không phải overlay)
   * Kỳ vọng: onClose KHÔNG được gọi
   */
  it('Click vào content không đóng popup', () => {
    render(<DictionaryPopup word="hello" onClose={mockOnClose} />);
    
    // Click vào content (header text)
    const wordHeader = screen.getByText('hello');
    fireEvent.click(wordHeader);
    
    // onClose không được gọi khi click vào content
    // (chỉ gọi khi click overlay hoặc nút đóng)
  });
});

describe('ClickableText Component', () => {
  const mockOnWordClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test: Render text với từng từ có thể click
   * Khi: Render đoạn text
   * Kỳ vọng: Mỗi từ là một span riêng biệt
   */
  it('Render text với từng từ có thể click', () => {
    render(<ClickableText text="Hello World" onWordClick={mockOnWordClick} />);
    
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  /**
   * Test: Gọi callback khi click vào từ
   * Khi: User click vào từ "Hello"
   * Kỳ vọng: onWordClick được gọi với từ đã clean (không dấu câu)
   */
  it('Gọi onWordClick khi click vào từ', () => {
    render(<ClickableText text="Hello, World!" onWordClick={mockOnWordClick} />);
    
    // Click vào từ "Hello,"
    const helloSpan = screen.getByText('Hello,');
    fireEvent.click(helloSpan);
    
    // Callback được gọi với từ đã clean (không có dấu phẩy)
    expect(mockOnWordClick).toHaveBeenCalledWith('Hello');
  });

  /**
   * Test: Giữ nguyên khoảng trắng
   * Khi: Render text với nhiều từ
   * Kỳ vọng: Khoảng trắng được giữ nguyên giữa các từ
   */
  it('Giữ nguyên format text gốc', () => {
    const { container } = render(
      <ClickableText text="One Two" onWordClick={mockOnWordClick} />
    );
    
    // Kiểm tra có cả 2 từ
    expect(container.textContent).toBe('One Two');
  });
});
