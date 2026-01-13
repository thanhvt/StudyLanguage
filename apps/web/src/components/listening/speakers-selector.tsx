'use client';

import { Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * SpeakersSelector - Component chọn số người nói
 * 
 * Mục đích: Cho phép user chọn 2, 3, hoặc 4 người nói
 * Tham số đầu vào:
 *   - value: Giá trị hiện tại
 *   - onChange: Callback khi thay đổi giá trị
 * Khi nào sử dụng: Trong form tạo hội thoại Listening
 */
interface SpeakersSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function SpeakersSelector({ value, onChange }: SpeakersSelectorProps) {
  const speakerOptions = [2, 3, 4];

  /**
   * Render icons cho số người
   */
  const renderSpeakerIcons = (count: number) => {
    return (
      <div className="flex -space-x-1 mr-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={`
              w-4 h-4 rounded-full border-2 border-background
              ${value === count ? 'bg-primary-foreground' : 'bg-muted-foreground/30'}
            `}
            style={{ zIndex: count - i }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Users className="w-4 h-4 text-primary" />
        Số người nói
      </label>
      
      <div className="flex flex-wrap gap-2">
        {speakerOptions.map((count) => (
          <Button
            key={count}
            type="button"
            variant={value === count ? 'default' : 'outline'}
            size="sm"
            onClick={() => onChange(count)}
            className={`
              relative overflow-hidden transition-all duration-300
              ${value === count ? 'speakers-pill-active shadow-md' : 'hover:border-primary/50'}
            `}
          >
            {renderSpeakerIcons(count)}
            {count} người
          </Button>
        ))}
      </div>
    </div>
  );
}
