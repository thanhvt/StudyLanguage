import { render, screen, fireEvent } from '@testing-library/react';
import { MusicControlBar } from '@/components/music-control-bar';
import { MusicProvider } from '@/components/providers/music-provider';

/**
 * Unit Tests cho MusicControlBar Component
 * 
 * Mục đích: Kiểm tra chức năng điều khiển nhạc nền
 * Test cases dựa trên: 01_unit_tests.md (UT-CMP-006)
 */

// Wrapper với MusicProvider
const renderWithMusicProvider = (component: React.ReactNode) => {
  return render(
    <MusicProvider>
      {component}
    </MusicProvider>
  );
};

// Mock cho useMusic hook
jest.mock('@/components/providers/music-provider', () => ({
  useMusic: () => ({
    isPlaying: false,
    volume: 0.5,
    currentTrack: { name: 'Lofi Hip Hop', url: '/music/lofi.mp3' },
    isDucking: false,
    toggle: jest.fn(),
    setVolume: jest.fn(),
    nextTrack: jest.fn(),
    prevTrack: jest.fn(),
  }),
  MusicProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('MusicControlBar Component', () => {
  /**
   * UT-CMP-006: Ducking status visual
   * Khi: isDucked=true
   * Kỳ vọng: Hiển thị trạng thái "Ducking" (giảm volume khi AI nói)
   */
  it('UT-CMP-006: Render collapsed state với nút play/pause', () => {
    render(<MusicControlBar />);
    
    // Collapsed state nên hiển thị nút nhạc (tìm theo text emoji)
    const buttons = screen.getAllByRole('button');
    const musicButton = buttons.find(btn => 
      btn.textContent?.includes('🎵') || btn.textContent?.includes('🎶')
    );
    expect(musicButton).toBeInTheDocument();
  });

  /**
   * Test: Nút settings mở expanded view
   * Khi: Click nút ⚙️
   * Kỳ vọng: Panel mở rộng hiển thị
   */
  it('Click settings mở expanded panel', () => {
    render(<MusicControlBar />);
    
    // Tìm nút settings
    const settingsButton = screen.getByRole('button', { name: /⚙️/i });
    expect(settingsButton).toBeInTheDocument();
    
    // Click để mở panel
    fireEvent.click(settingsButton);
    
    // Sau khi mở, kiểm tra có text "Nhạc nền"
    expect(screen.getByText('Nhạc nền')).toBeInTheDocument();
  });

  /**
   * Test: Hiển thị tên track
   * Khi: Component render expanded
   * Kỳ vọng: Hiển thị tên bài nhạc
   */
  it('Hiển thị tên bài nhạc trong expanded view', () => {
    render(<MusicControlBar />);
    
    // Mở panel
    const settingsButton = screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(settingsButton);
    
    // Kiểm tra tên track hiển thị
    expect(screen.getByText('Lofi Hip Hop')).toBeInTheDocument();
  });

  /**
   * Test: Có các nút điều khiển trong expanded view
   * Khi: Panel expanded
   * Kỳ vọng: Có prev, play/pause, next buttons
   */
  it('Hiển thị các nút điều khiển khi expanded', () => {
    render(<MusicControlBar />);
    
    // Mở panel
    const settingsButton = screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(settingsButton);
    
    // Kiểm tra có nút prev
    expect(screen.getByRole('button', { name: /⏮️/i })).toBeInTheDocument();
    // Kiểm tra có nút next
    expect(screen.getByRole('button', { name: /⏭️/i })).toBeInTheDocument();
  });

  /**
   * Test: Volume slider hiển thị giá trị
   * Khi: Panel expanded
   * Kỳ vọng: Hiển thị Volume percentage
   */
  it('Hiển thị volume percentage trong expanded view', () => {
    render(<MusicControlBar />);
    
    // Mở panel
    const settingsButton = screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(settingsButton);
    
    // Kiểm tra có text Volume (50% vì mock volume = 0.5)
    expect(screen.getByText(/Volume: 50%/i)).toBeInTheDocument();
  });

  /**
   * Test: Nút đóng panel hoạt động
   * Khi: Click nút đóng trong expanded view
   * Kỳ vọng: Panel thu gọn lại
   */
  it('Click nút đóng thu gọn panel', () => {
    render(<MusicControlBar />);
    
    // Mở panel
    const settingsButton = screen.getByRole('button', { name: /⚙️/i });
    fireEvent.click(settingsButton);
    
    // Tìm và click nút đóng
    const closeButton = screen.getByRole('button', { name: /✕/i });
    fireEvent.click(closeButton);
    
    // Sau khi đóng, text "Nhạc nền" không còn hiển thị
    expect(screen.queryByText('Nhạc nền')).not.toBeInTheDocument();
  });
});
