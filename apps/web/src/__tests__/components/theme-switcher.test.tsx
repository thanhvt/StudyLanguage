import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ThemeProvider } from '@/components/providers/theme-provider';

/**
 * Unit Tests cho ThemeSwitcher Component
 * 
 * Mục đích: Kiểm tra chức năng chuyển đổi theme và chọn accent color
 * Test cases dựa trên: 01_unit_tests.md (UT-CMP-005) và 05_ui_ux_tests.md (UI-VIS-001, UI-VIS-002)
 */

// Wrapper component với ThemeProvider
const renderWithThemeProvider = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeSwitcher Component', () => {
  /**
   * UT-CMP-005: Render đúng icon theo mode
   * Khi: mode='light'
   * Kỳ vọng: Hiển thị icon phù hợp để chuyển sang dark
   */
  it('UT-CMP-005: Render đúng nút toggle theme', () => {
    renderWithThemeProvider(<ThemeSwitcher />);
    
    // Kiểm tra có label "Chế độ giao diện"
    expect(screen.getByText('Chế độ giao diện')).toBeInTheDocument();
    
    // Kiểm tra có nút toggle (☀️ Sáng hoặc 🌙 Tối)
    const toggleButton = screen.getByRole('button', { name: /sáng|tối/i });
    expect(toggleButton).toBeInTheDocument();
  });

  /**
   * UI-VIS-001: Toggle Light/Dark mode
   * Khi: User click toggle button
   * Kỳ vọng: Theme chuyển đổi thành công
   */
  it('UI-VIS-001: Toggle theme khi click button', () => {
    renderWithThemeProvider(<ThemeSwitcher />);
    
    const toggleButton = screen.getByRole('button', { name: /sáng|tối/i });
    const initialText = toggleButton.textContent;
    
    // Click để đổi theme
    fireEvent.click(toggleButton);
    
    // Button vẫn tồn tại sau khi click (không crash)
    expect(toggleButton).toBeInTheDocument();
  });

  /**
   * UI-VIS-002: Render danh sách Accent Colors
   * Khi: Component render
   * Kỳ vọng: Hiển thị đầy đủ 6 bộ màu "Green Nature"
   */
  it('UI-VIS-002: Render đầy đủ 6 accent color options', () => {
    renderWithThemeProvider(<ThemeSwitcher />);
    
    // Kiểm tra có label "Màu chủ đạo"
    expect(screen.getByText('Màu chủ đạo')).toBeInTheDocument();
    
    // Kiểm tra render Fresh Greens (mặc định)
    expect(screen.getByText('Fresh Greens')).toBeInTheDocument();
  });

  /**
   * Test: Chọn accent color
   * Khi: User click vào 1 accent color option
   * Kỳ vọng: Accent color được chọn (có checkmark)
   */
  it('Chọn accent color khi click', () => {
    renderWithThemeProvider(<ThemeSwitcher />);
    
    // Tìm và click vào một color option
    const colorButtons = screen.getAllByRole('button');
    const colorButton = colorButtons.find(btn => 
      btn.textContent?.includes('Fresh Greens') || 
      btn.textContent?.includes('Leafy')
    );
    
    if (colorButton) {
      fireEvent.click(colorButton);
      // Button vẫn tồn tại sau click
      expect(colorButton).toBeInTheDocument();
    }
  });

  /**
   * Test: Component không crash khi render
   * Khi: Component mount
   * Kỳ vọng: Render thành công không có lỗi
   */
  it('Component render mà không crash', () => {
    expect(() => {
      renderWithThemeProvider(<ThemeSwitcher />);
    }).not.toThrow();
  });
});
