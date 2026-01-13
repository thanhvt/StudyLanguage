'use client';

import { useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * DurationSelector - Component chọn thời lượng hội thoại
 * 
 * Mục đích: Cho phép user chọn nhanh 5/10/15 phút hoặc tự nhập (max 20)
 * Tham số đầu vào:
 *   - value: Giá trị hiện tại
 *   - onChange: Callback khi thay đổi giá trị
 * Khi nào sử dụng: Trong form tạo hội thoại Listening
 */
interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const [isCustom, setIsCustom] = useState(![5, 10, 15].includes(value));
  const [customValue, setCustomValue] = useState(value.toString());

  const presetDurations = [5, 10, 15];

  /**
   * Xử lý khi click vào preset duration
   */
  const handlePresetClick = (duration: number) => {
    setIsCustom(false);
    onChange(duration);
  };

  /**
   * Xử lý khi thay đổi custom input
   */
  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomValue(val);
    
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= 1 && numVal <= 20) {
      onChange(numVal);
    }
  };

  /**
   * Bật chế độ custom input
   */
  const enableCustom = () => {
    setIsCustom(true);
    setCustomValue(value.toString());
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-medium">
        <Clock className="w-4 h-4 text-primary" />
        Thời lượng (phút)
      </label>
      
      <div className="flex flex-wrap gap-2">
        {/* Preset buttons */}
        {presetDurations.map((duration) => (
          <Button
            key={duration}
            type="button"
            variant={!isCustom && value === duration ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetClick(duration)}
            className={`
              relative overflow-hidden transition-all duration-300
              ${!isCustom && value === duration ? 'duration-pill-active' : 'hover:border-primary/50'}
            `}
          >
            {!isCustom && value === duration && (
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
            )}
            {duration} phút
          </Button>
        ))}

        {/* Custom button */}
        {!isCustom ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enableCustom}
            className="hover:border-primary/50"
          >
            Tùy chỉnh
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={20}
              value={customValue}
              onChange={handleCustomChange}
              className="w-20 h-9 text-center duration-input-custom"
              placeholder="1-20"
            />
            <span className="text-sm text-muted-foreground">phút (max 20)</span>
          </div>
        )}
      </div>

      {/* Validation message */}
      {isCustom && (parseInt(customValue, 10) > 20 || parseInt(customValue, 10) < 1) && (
        <p className="text-xs text-destructive">
          Vui lòng nhập từ 1 đến 20 phút
        </p>
      )}
    </div>
  );
}
