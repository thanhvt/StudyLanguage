/**
 * Unit Tests cho TopicPicker component
 *
 * Mục đích: Test UI và interactions của TopicPicker
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicPicker } from '@/components/listening/topic-picker';

describe('TopicPicker', () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Render Tests
  // ============================================

  describe('render', () => {
    it('nên render search input', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      expect(screen.getByPlaceholderText(/Tìm kiếm scenario/i)).toBeInTheDocument();
    });

    it('nên render 3 category tabs', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      expect(screen.getByText('💻')).toBeInTheDocument();
      expect(screen.getByText('🌍')).toBeInTheDocument();
      expect(screen.getByText('👤')).toBeInTheDocument();
    });

    it('nên hiển thị category description', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      // IT is default active
      expect(screen.getByText(/Họp kỹ thuật/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // Tab Switching Tests
  // ============================================

  describe('tab switching', () => {
    it('nên switch category khi click tab', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      // Click Daily tab
      fireEvent.click(screen.getByText('🌍'));

      // Should show Daily description
      expect(screen.getByText(/Sân bay, siêu thị/i)).toBeInTheDocument();
    });

    it('nên highlight active tab', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      const itTab = screen.getByText('💻').closest('button');
      expect(itTab).toHaveClass('topic-tab-active');
    });
  });

  // ============================================
  // Subcategory Accordion Tests
  // ============================================

  describe('subcategory accordion', () => {
    it('nên expand subcategory khi click', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      // Click Agile Ceremonies subcategory
      fireEvent.click(screen.getByText('Agile Ceremonies'));

      // Should show scenarios
      expect(screen.getByText('Daily Stand-up Update')).toBeInTheDocument();
    });

    it('nên collapse subcategory khi click lần 2', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      const subCategory = screen.getByText('Agile Ceremonies');
      
      // Expand
      fireEvent.click(subCategory);
      expect(screen.getByText('Daily Stand-up Update')).toBeInTheDocument();
      
      // Collapse
      fireEvent.click(subCategory);
      expect(screen.queryByText('Daily Stand-up Update')).not.toBeInTheDocument();
    });
  });

  // ============================================
  // Selection Tests
  // ============================================

  describe('selection', () => {
    it('nên gọi onSelect khi chọn scenario', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      // Expand subcategory
      fireEvent.click(screen.getByText('Agile Ceremonies'));

      // Click scenario
      fireEvent.click(screen.getByText('Daily Stand-up Update'));

      expect(mockOnSelect).toHaveBeenCalledWith(
        'Daily Stand-up Update',
        'it',
        'Agile Ceremonies'
      );
    });

    it('nên hiển thị selected topic indicator', () => {
      render(<TopicPicker onSelect={mockOnSelect} selectedTopic="Daily Stand-up Update" />);

      expect(screen.getByText(/Đã chọn:/)).toBeInTheDocument();
      expect(screen.getByText('Daily Stand-up Update')).toBeInTheDocument();
    });

    it('nên gọi onSelect với empty string khi click Xóa', () => {
      render(<TopicPicker onSelect={mockOnSelect} selectedTopic="Daily Stand-up Update" />);

      fireEvent.click(screen.getByText('Xóa'));

      expect(mockOnSelect).toHaveBeenCalledWith('');
    });
  });

  // ============================================
  // Search Tests
  // ============================================

  describe('search', () => {
    it('nên tìm kiếm và hiển thị kết quả', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      const searchInput = screen.getByPlaceholderText(/Tìm kiếm scenario/i);
      fireEvent.change(searchInput, { target: { value: 'Sprint' } });

      // Should show search results
      expect(screen.getByText(/Tìm thấy/)).toBeInTheDocument();
    });

    it('nên hiển thị thông báo không tìm thấy', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      const searchInput = screen.getByPlaceholderText(/Tìm kiếm scenario/i);
      fireEvent.change(searchInput, { target: { value: 'xyzabc123' } });

      expect(screen.getByText('Không tìm thấy scenario phù hợp')).toBeInTheDocument();
    });

    it('nên gọi onSelect khi chọn từ search results', () => {
      render(<TopicPicker onSelect={mockOnSelect} />);

      const searchInput = screen.getByPlaceholderText(/Tìm kiếm scenario/i);
      fireEvent.change(searchInput, { target: { value: 'Sprint Planning' } });

      // Click result
      const results = screen.getAllByText('Sprint Planning - Estimation');
      fireEvent.click(results[0]);

      expect(mockOnSelect).toHaveBeenCalled();
    });
  });
});
