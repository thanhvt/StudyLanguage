/**
 * Unit Tests cho SpeakersSelector component
 *
 * Mục đích: Test UI và interactions của SpeakersSelector
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpeakersSelector } from '@/components/listening/speakers-selector';

describe('SpeakersSelector', () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // Render Tests
  // ============================================

  describe('render', () => {
    it('nên render tất cả speaker options', () => {
      render(<SpeakersSelector value={2} onChange={mockOnChange} />);

      expect(screen.getByText('2 người')).toBeInTheDocument();
      expect(screen.getByText('3 người')).toBeInTheDocument();
      expect(screen.getByText('4 người')).toBeInTheDocument();
    });

    it('nên hiển thị label đúng', () => {
      render(<SpeakersSelector value={2} onChange={mockOnChange} />);

      expect(screen.getByText('Số người nói')).toBeInTheDocument();
    });
  });

  // ============================================
  // Interaction Tests
  // ============================================

  describe('interactions', () => {
    it('nên gọi onChange khi click button', () => {
      render(<SpeakersSelector value={2} onChange={mockOnChange} />);

      fireEvent.click(screen.getByText('3 người'));

      expect(mockOnChange).toHaveBeenCalledWith(3);
    });

    it('nên highlight button active', () => {
      render(<SpeakersSelector value={3} onChange={mockOnChange} />);

      const button3 = screen.getByText('3 người').closest('button');
      expect(button3).toHaveAttribute('data-variant', 'default');
    });

    it('nên không highlight các buttons không active', () => {
      render(<SpeakersSelector value={2} onChange={mockOnChange} />);

      const button3 = screen.getByText('3 người').closest('button');
      expect(button3).toHaveAttribute('data-variant', 'outline');
    });
  });
});
