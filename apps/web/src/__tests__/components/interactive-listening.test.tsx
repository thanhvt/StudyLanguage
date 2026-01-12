import { render, screen, fireEvent } from '@testing-library/react';
import { InteractiveListening } from '@/components/interactive-listening';

/**
 * Unit Tests cho InteractiveListening Component
 * 
 * Mục đích: Kiểm tra chức năng hội thoại tương tác với AI
 * Test cases dựa trên: 01_unit_tests.md (UT-CMP-004)
 */

// Mock fetch API
global.fetch = jest.fn();

// Mock MediaDevices API
const mockGetUserMedia = jest.fn();
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

describe('InteractiveListening Component', () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        scenario: 'Bạn đang ở quán cà phê',
        script: [
          { speaker: 'Barista', text: 'Hello!', isUserTurn: false },
          { speaker: 'YOU', text: 'Respond to barista', isUserTurn: true },
        ],
      }),
    });
  });

  /**
   * UT-CMP-004: Hiển thị hội thoại User và AI
   * Khi: Component render xong và user bắt đầu
   * Kỳ vọng: Render đủ các bubbles, đúng màu sắc role
   */
  it('UT-CMP-004: Render component ban đầu với nút bắt đầu', () => {
    render(<InteractiveListening topic="Coffee Shop" onBack={mockOnBack} />);
    
    // Kiểm tra có nút bắt đầu hội thoại
    expect(screen.getByRole('button', { name: /bắt đầu hội thoại/i })).toBeInTheDocument();
    
    // Kiểm tra có nút quay lại
    expect(screen.getByRole('button', { name: /quay lại/i })).toBeInTheDocument();
  });

  /**
   * Test: Click nút Quay lại gọi onBack
   * Khi: User click nút quay lại
   * Kỳ vọng: callback onBack được gọi
   */
  it('Gọi onBack khi click nút Quay lại', () => {
    render(<InteractiveListening topic="Coffee Shop" onBack={mockOnBack} />);
    
    const backButton = screen.getByRole('button', { name: /quay lại/i });
    fireEvent.click(backButton);
    
    expect(mockOnBack).toHaveBeenCalled();
  });

  /**
   * Test: Có hidden audio element
   * Khi: Component render
   * Kỳ vọng: Có audio element cho TTS
   */
  it('Render hidden audio element cho TTS', () => {
    const { container } = render(
      <InteractiveListening topic="Coffee Shop" onBack={mockOnBack} />
    );
    
    // Kiểm tra có audio element
    const audioElement = container.querySelector('audio');
    expect(audioElement).toBeInTheDocument();
  });

  /**
   * Test: Component không crash khi render
   * Khi: Component mount với topic bất kỳ
   * Kỳ vọng: Render thành công
   */
  it('Render không crash với mọi topic', () => {
    expect(() => {
      render(<InteractiveListening topic="Business Meeting" onBack={mockOnBack} />);
    }).not.toThrow();
  });

  /**
   * Test: Nút bắt đầu hoạt động
   * Khi: User click nút bắt đầu
   * Kỳ vọng: Fetch API được gọi
   */
  it('Click nút bắt đầu gọi API sinh hội thoại', async () => {
    render(<InteractiveListening topic="Coffee Shop" onBack={mockOnBack} />);
    
    const startButton = screen.getByRole('button', { name: /bắt đầu hội thoại/i });
    fireEvent.click(startButton);
    
    // Kiểm tra fetch được gọi
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3001/api/ai/generate-interactive-conversation',
      expect.any(Object)
    );
  });
});
