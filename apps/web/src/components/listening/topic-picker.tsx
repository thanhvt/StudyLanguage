'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Sparkles, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TOPIC_CATEGORIES, searchScenarios } from '@/data/topic-data';
import { TopicCategory } from '@/types/listening-types';
import { useFavoriteScenarios } from '@/hooks/use-favorite-scenarios';

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
  const [activeCategory, setActiveCategory] = useState<TopicCategory['id'] | 'favorites'>('it');
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Hook quản lý favorites
  const { isFavorite, toggleFavorite, favoriteCount } = useFavoriteScenarios();

  // Lấy favorite scenarios để hiển thị trong tab Yêu thích
  const favoriteScenarios = useMemo(() => {
    const results: { category: (typeof TOPIC_CATEGORIES)[0]; subCategory: (typeof TOPIC_CATEGORIES)[0]['subCategories'][0]; scenario: (typeof TOPIC_CATEGORIES)[0]['subCategories'][0]['scenarios'][0] }[] = [];
    
    for (const category of TOPIC_CATEGORIES) {
      for (const subCategory of category.subCategories) {
        for (const scenario of subCategory.scenarios) {
          if (isFavorite(scenario.id)) {
            results.push({ category, subCategory, scenario });
          }
        }
      }
    }
    
    return results;
  }, [isFavorite]);

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
   * Format: "Scenario Name: Description" để hiển thị đầy đủ trong ô Chủ đề
   */
  const handleSelect = (scenarioName: string, scenarioDescription: string, categoryId?: string, subCategoryName?: string) => {
    // Ghép name + description để người dùng thấy đầy đủ thông tin
    const fullTopic = scenarioDescription 
      ? `${scenarioName}: ${scenarioDescription}` 
      : scenarioName;
    onSelect(fullTopic, categoryId, subCategoryName);
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
          {filteredResults.map(({ category, subCategory, scenario }) => {
            const fullTopic = `${scenario.name}: ${scenario.description}`;
            return (
            <button
              key={scenario.id}
              onClick={() => handleSelect(scenario.name, scenario.description, category.id, subCategory.name)}
              className={`
                w-full text-left p-2 rounded-lg transition-all
                hover:bg-primary/10 hover:border-primary/30
                ${selectedTopic === fullTopic || selectedTopic === scenario.name ? 'bg-primary/20 border border-primary/50' : ''}
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
          );
          })}
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
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl overflow-x-auto">
            {/* Tab Yêu thích */}
            <button
              onClick={() => setActiveCategory('favorites')}
              className={`
                flex items-center justify-center gap-2 py-2 px-3 rounded-lg
                text-sm font-medium transition-all duration-300 shrink-0
                ${activeCategory === 'favorites'
                  ? 'bg-background shadow-md topic-tab-active'
                  : 'hover:bg-background/50'
                }
              `}
            >
              <Star className={`w-4 h-4 ${activeCategory === 'favorites' ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              <span className="hidden sm:inline">Yêu thích</span>
              {favoriteCount > 0 && (
                <span className="bg-primary/20 text-primary text-xs px-1.5 py-0.5 rounded-full">
                  {favoriteCount}
                </span>
              )}
            </button>
            
            {/* Các category khác */}
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

          {/* Favorites Tab Content */}
          {activeCategory === 'favorites' && (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 mobile-scroll">
              {favoriteScenarios.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Chưa có scenario yêu thích</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Nhấn ⭐ bên cạnh một scenario để ghim
                  </p>
                </div>
              ) : (
                favoriteScenarios.map(({ category, subCategory, scenario }) => {
                  const fullTopic = `${scenario.name}: ${scenario.description}`;
                  const isSelected = selectedTopic === fullTopic || selectedTopic === scenario.name;
                  
                  return (
                    <div
                      key={scenario.id}
                      className={`
                        flex items-center gap-2 p-2 rounded-lg transition-all
                        hover:bg-primary/10
                        ${isSelected ? 'bg-primary/20 ring-1 ring-primary/50' : ''}
                      `}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(scenario.id);
                        }}
                        className="text-yellow-500 hover:text-yellow-600 shrink-0"
                      >
                        <Star className="w-4 h-4 fill-yellow-500" />
                      </button>
                      <button
                        className="flex-1 text-left min-w-0"
                        onClick={() => handleSelect(scenario.name, scenario.description, category.id, subCategory.name)}
                      >
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                          <span>{category.icon}</span>
                          <span>{subCategory.name}</span>
                        </div>
                        <p className="font-medium text-sm truncate">{scenario.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{scenario.description}</p>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Category Description */}
          {activeCategory !== 'favorites' && currentCategory && (
            <p className="text-sm text-muted-foreground">
              {currentCategory.description}
            </p>
          )}

          {/* SubCategories with Accordion */}
          {activeCategory !== 'favorites' && (
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
                      {subCategory.scenarios.map((scenario) => {
                        const fullTopic = `${scenario.name}: ${scenario.description}`;
                        const isSelected = selectedTopic === fullTopic || selectedTopic === scenario.name;
                        const isFav = isFavorite(scenario.id);
                        
                        return (
                          <div
                            key={scenario.id}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg transition-all
                              hover:bg-primary/10
                              ${isSelected 
                                ? 'bg-primary/20 ring-1 ring-primary/50' 
                                : ''
                              }
                            `}
                          >
                            {/* Nút ghim yêu thích */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(scenario.id);
                              }}
                              className={`shrink-0 transition-colors ${isFav ? 'text-yellow-500 hover:text-yellow-600' : 'text-muted-foreground/50 hover:text-yellow-500'}`}
                              title={isFav ? 'Bỏ ghim' : 'Ghim yêu thích'}
                            >
                              <Star className={`w-4 h-4 ${isFav ? 'fill-yellow-500' : ''}`} />
                            </button>
                            
                            {/* Nội dung scenario */}
                            <button
                              className="flex-1 text-left min-w-0"
                              onClick={() => handleSelect(scenario.name, scenario.description, currentCategory.id, subCategory.name)}
                            >
                              <div className="flex items-start gap-2">
                                {isSelected && (
                                  <Sparkles className="w-4 h-4 text-primary mt-0.5 animate-pulse shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{scenario.name}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {scenario.description}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          )}
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
