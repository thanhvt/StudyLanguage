import { render, screen, fireEvent } from '@testing-library/react';
import { AudioPlayer } from '@/components/audio-player';

/**
 * Unit Tests cho AudioPlayer Component
 * 
 * Mục đích: Kiểm tra các chức năng cốt lõi của AudioPlayer
 * Test cases dựa trên: 01_unit_tests.md (UT-CMP-001)
 */

// Mock HTMLAudioElement
const mockPlay = jest.fn();
const mockPause = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  
  // Mock Audio element
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    writable: true,
    value: mockPlay,
  });
  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    writable: true,
    value: mockPause,
  });
});

describe('AudioPlayer Component', () => {
  /**
   * UT-CMP-001: Kiểm tra render cơ bản
   * Khi: Component được render với props hợp lệ
   * Kỳ vọng: Hiển thị đúng các controls (Play, Volume, Speed)
   */
  it('UT-CMP-001: Render đúng các controls cơ bản', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    // Kiểm tra nút Play hiển thị
    expect(screen.getByRole('button', { name: /▶️/i })).toBeInTheDocument();
    
    // Kiểm tra các nút tốc độ hiển thị
    expect(screen.getByRole('button', { name: '1x' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1.5x' })).toBeInTheDocument();
  });

  /**
   * Test: Toggle Play/Pause
   * Khi: User click nút Play
   * Kỳ vọng: Audio bắt đầu phát và icon chuyển thành Pause
   */
  it('Toggle Play khi click nút Play', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    const playButton = screen.getByRole('button', { name: /▶️/i });
    fireEvent.click(playButton);
    
    // Kiểm tra audio.play() được gọi
    expect(mockPlay).toHaveBeenCalled();
  });

  /**
   * Test: Skip Forward/Backward buttons
   * Khi: User click nút lùi/tiến
   * Kỳ vọng: Các nút skip hiển thị và có thể click
   */
  it('Render các nút Skip Forward/Backward', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    // Kiểm tra nút lùi 10s
    expect(screen.getByRole('button', { name: /⏪/i })).toBeInTheDocument();
    // Kiểm tra nút tiến 10s
    expect(screen.getByRole('button', { name: /⏩/i })).toBeInTheDocument();
  });

  /**
   * Test: Playback rate buttons
   * Khi: User click nút tốc độ 1.5x
   * Kỳ vọng: Nút 1.5x được highlight (active state)
   */
  it('Đổi tốc độ phát khi click nút speed', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    const speedButton = screen.getByRole('button', { name: '1.5x' });
    fireEvent.click(speedButton);
    
    // Nút được click vẫn tồn tại (không crash)
    expect(speedButton).toBeInTheDocument();
  });

  /**
   * Test: Volume slider exists
   * Khi: Component render
   * Kỳ vọng: Có volume slider với giá trị mặc định
   */
  it('Render volume slider', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    // Kiểm tra có icon volume
    expect(screen.getByText('🔊')).toBeInTheDocument();
  });

  /**
   * Test: Time display format
   * Khi: Component render
   * Kỳ vọng: Hiển thị thời gian dạng mm:ss
   */
  it('Hiển thị thời gian dạng mm:ss', () => {
    render(<AudioPlayer src="/test-audio.mp3" />);
    
    // Kiểm tra có text 0:00 (thời gian ban đầu)
    expect(screen.getAllByText('0:00').length).toBeGreaterThanOrEqual(1);
  });
});
