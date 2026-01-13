'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TOPIC_CATEGORIES, searchScenarios } from '@/data/topic-data';
import { TopicCategory } from '@/types/listening-types';

/**
 * TopicPicker - Component chọn chủ đề gợi ý
 * 
 * Mục đích: Hiển thị 140 scenarios theo 3 categories với search và accordion
 * Tham số đầu vào:
 *   - onSelect: Callback khi chọn một scenario
 *   - selectedTopic: Topic hiện tại đã chọn
 * Khi nào sử dụng: Trong form tạo hội thoại Listening
 */
interface TopicPickerProps {
  onSelect: (topic: string, category?: string, subCategory?: string) => void;
  selectedTopic?: string;
}

export function TopicPicker({ onSelect, selectedTopic }: TopicPickerProps) {
  const [activeCategory, setActiveCategory] = useState<TopicCategory['id']>('it');
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Lọc scenarios theo search query
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return searchScenarios(searchQuery);
  }, [searchQuery]);

  /**
   * Toggle expand/collapse subcategory
   */
  const toggleSubCategory = (subCategoryId: string) => {
    setExpandedSubCategories(prev =>
      prev.includes(subCategoryId)
        ? prev.filter(id => id !== subCategoryId)
        : [...prev, subCategoryId]
    );
  };

  /**
   * Xử lý khi chọn scenario
   */
  const handleSelect = (scenarioName: string, categoryId?: string, subCategoryName?: string) => {
    onSelect(scenarioName, categoryId, subCategoryName);
    setSearchQuery('');
  };

  // Lấy category đang active
  const currentCategory = TOPIC_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Tìm kiếm scenario... (VD: Sprint, Hotel, Dating)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Search Results */}
      {filteredResults && filteredResults.length > 0 && (
        <div className="glass-card p-3 max-h-60 overflow-y-auto space-y-2">
          <p className="text-xs text-muted-foreground mb-2">
            Tìm thấy {filteredResults.length} kết quả
          </p>
          {filteredResults.map(({ category, subCategory, scenario }) => (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario.name, category.id, subCategory.name)}
              className={`
                w-full text-left p-2 rounded-lg transition-all
                hover:bg-primary/10 hover:border-primary/30
                ${selectedTopic === scenario.name ? 'bg-primary/20 border border-primary/50' : ''}
              `}
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span>{category.icon}</span>
                <span>{category.name}</span>
                <span>›</span>
                <span>{subCategory.name}</span>
              </div>
              <p className="font-medium text-sm">{scenario.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{scenario.description}</p>
            </button>
          ))}
        </div>
      )}

      {filteredResults && filteredResults.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Không tìm thấy scenario phù hợp
        </p>
      )}

      {/* Category Tabs - chỉ hiện khi không search */}
      {!searchQuery && (
        <>
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl">
            {TOPIC_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                  text-sm font-medium transition-all duration-300
                  ${activeCategory === category.id
                    ? 'bg-background shadow-md topic-tab-active'
                    : 'hover:bg-background/50'
                  }
                `}
              >
                <span className="text-lg">{category.icon}</span>
                <span className="hidden sm:inline">{category.name}</span>
              </button>
            ))}
          </div>

          {/* Category Description */}
          {currentCategory && (
            <p className="text-sm text-muted-foreground">
              {currentCategory.description}
            </p>
          )}

          {/* SubCategories with Accordion */}
          <div className="space-y-2 max-h-80 overflow-y-auto pr-2 mobile-scroll">
            {currentCategory?.subCategories.map((subCategory) => {
              const isExpanded = expandedSubCategories.includes(subCategory.id);
              
              return (
                <div key={subCategory.id} className="border border-border/50 rounded-xl overflow-hidden">
                  {/* SubCategory Header */}
                  <button
                    onClick={() => toggleSubCategory(subCategory.id)}
                    className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <span className="font-medium text-sm">{subCategory.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {subCategory.scenarios.length} scenarios
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </div>
                  </button>

                  {/* Scenarios List */}
                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-background/50">
                      {subCategory.scenarios.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => handleSelect(scenario.name, currentCategory.id, subCategory.name)}
                          className={`
                            w-full text-left p-2 rounded-lg transition-all
                            hover:bg-primary/10
                            ${selectedTopic === scenario.name 
                              ? 'bg-primary/20 ring-1 ring-primary/50' 
                              : ''
                            }
                          `}
                        >
                          <div className="flex items-start gap-2">
                            {selectedTopic === scenario.name && (
                              <Sparkles className="w-4 h-4 text-primary mt-0.5 animate-pulse" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{scenario.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {scenario.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Quick Select Button */}
      {selectedTopic && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 rounded-lg">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm">
            Đã chọn: <strong>{selectedTopic}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelect('')}
            className="ml-auto text-xs"
          >
            Xóa
          </Button>
        </div>
      )}
    </div>
  );
}
