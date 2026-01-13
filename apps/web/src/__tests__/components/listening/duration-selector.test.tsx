/**
 * Unit Tests cho DurationSelector component
 *
 * Mục đích: Test UI và interactions của DurationSelector
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DurationSelector } from '@/components/listening/duration-selector';

describe('DurationSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Render Tests
  // ============================================

  describe('render', () => {
    it('nên render tất cả preset buttons', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      expect(screen.getByText('5 phút')).toBeInTheDocument();
      expect(screen.getByText('10 phút')).toBeInTheDocument();
      expect(screen.getByText('15 phút')).toBeInTheDocument();
      expect(screen.getByText('Tùy chỉnh')).toBeInTheDocument();
    });

    it('nên hiển thị label đúng', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      expect(screen.getByText('Thời lượng (phút)')).toBeInTheDocument();
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================

  describe('interactions', () => {
    it('nên gọi onChange khi click preset button', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('10 phút'));

      expect(mockOnChange).toHaveBeenCalledWith(10);
    });

    it('nên highlight button active', () => {
      render(<DurationSelector value={10} onChange={mockOnChange} />);

      const button10 = screen.getByText('10 phút').closest('button');
      expect(button10).toHaveAttribute('data-variant', 'default');
    });

    it('nên hiển thị custom input khi click Tùy chỉnh', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Tùy chỉnh'));

      expect(screen.getByPlaceholderText('1-20')).toBeInTheDocument();
    });

    it('nên gọi onChange khi nhập custom value hợp lệ', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      // Click Tùy chỉnh
      fireEvent.click(screen.getByText('Tùy chỉnh'));

      // Nhập giá trị
      const input = screen.getByPlaceholderText('1-20');
      fireEvent.change(input, { target: { value: '12' } });

      expect(mockOnChange).toHaveBeenCalledWith(12);
    });

    it('nên hiển thị lỗi khi nhập giá trị ngoài range', () => {
      render(<DurationSelector value={5} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('Tùy chỉnh'));

      const input = screen.getByPlaceholderText('1-20');
      fireEvent.change(input, { target: { value: '25' } });

      expect(screen.getByText('Vui lòng nhập từ 1 đến 20 phút')).toBeInTheDocument();
    });
  });
});
