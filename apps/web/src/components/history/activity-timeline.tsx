'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Mic, BookOpen, Calendar, Clock, Pin, Star, Play } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { useHistory, HistoryEntry, formatRelativeTime } from '@/hooks/use-history';

/**
 * ActivityTimeline - Component hiển thị hoạt động học tập theo dòng thời gian
 * 
 * Mục đích: Hiển thị lịch sử học tập đẹp mắt với animations lung linh trên Home page
 * Tham số đầu vào:
 *   - maxItems: Số lượng items tối đa hiển thị (default: 5)
 *   - onViewAll: Callback khi click "Xem tất cả"
 *   - onOpenEntry: Callback khi click vào một entry
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Trên Home page để hiển thị hoạt động gần đây
 */

interface ActivityTimelineProps {
  maxItems?: number;
  onViewAll?: () => void;
  onOpenEntry?: (entry: HistoryEntry) => void;
}

/**
 * Nhóm entries theo ngày
 * 
 * @param entries - Danh sách entries
 * @returns Object với key là nhãn ngày, value là mảng entries
 */
function groupEntriesByDate(entries: HistoryEntry[]): Record<string, HistoryEntry[]> {
  const groups: Record<string, HistoryEntry[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  entries.forEach((entry) => {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    
    let label: string;
    if (entryDate.getTime() === today.getTime()) {
      label = 'Hôm nay';
    } else if (entryDate.getTime() === yesterday.getTime()) {
      label = 'Hôm qua';
    } else {
      // Format: "Thứ X, DD/MM"
      const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const dayName = dayNames[entryDate.getDay()];
      label = `${dayName}, ${entryDate.getDate().toString().padStart(2, '0')}/${(entryDate.getMonth() + 1).toString().padStart(2, '0')}`;
    }
    
    if (!groups[label]) {
      groups[label] = [];
    }
    groups[label].push(entry);
  });

  return groups;
}

/**
 * Lấy icon component cho từng loại skill
 */
function getSkillIcon(type: HistoryEntry['type']) {
  const icons = {
    listening: Headphones,
    speaking: Mic,
    reading: BookOpen,
  };
  return icons[type] || BookOpen;
}

/**
 * Lấy gradient class cho từng loại skill
 */
function getSkillGradient(type: HistoryEntry['type']) {
  const gradients = {
    listening: 'skill-card-listening',
    speaking: 'skill-card-speaking',
    reading: 'skill-card-reading',
  };
  return gradients[type] || 'skill-card-listening';
}

/**
 * Lấy màu border glow cho từng loại skill
 */
function getSkillGlow(type: HistoryEntry['type']) {
  const glows = {
    listening: 'hover:shadow-[0_0_25px_rgba(14,165,233,0.4)] border-sky-400/30',
    speaking: 'hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] border-emerald-400/30',
    reading: 'hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] border-purple-400/30',
  };
  return glows[type] || glows.listening;
}

/**
 * DateHeader - Header cho mỗi nhóm ngày
 */
function DateHeader({ label, isFirst }: { label: string; isFirst: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: isFirst ? 0 : 0.1 }}
      className="flex items-center gap-3 mb-4"
    >
      {/* Đường timeline dọc */}
      <div className="relative">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-glow">
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-primary/20 blur-md -z-10" />
      </div>
      
      <div>
        <h3 className="font-display font-semibold text-foreground">{label}</h3>
      </div>
    </motion.div>
  );
}

/**
 * TimelineItem - Một item trong timeline với animation
 */
function TimelineItem({ 
  entry, 
  index,
  isLast,
  onOpen 
}: { 
  entry: HistoryEntry; 
  index: number;
  isLast: boolean;
  onOpen?: (entry: HistoryEntry) => void;
}) {
  const IconComponent = getSkillIcon(entry.type);
  const gradientClass = getSkillGradient(entry.type);
  const glowClass = getSkillGlow(entry.type);
  
  // Tính thời gian từ createdAt
  const time = new Date(entry.createdAt).toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100
      }}
      className="pl-14 relative"
    >
      {/* Timeline connector line */}
      <div className="absolute left-5 top-0 bottom-0 w-px">
        <div className="w-full h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
      </div>
      
      {/* Timeline dot với glow */}
      <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.6)]">
        <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
      </div>

      {/* Card */}
      <GlassCard 
        className={`p-4 mb-3 cursor-pointer transition-all duration-300 border ${glowClass} hover:-translate-y-1`}
        hover="lift"
        onClick={() => onOpen?.(entry)}
      >
        <div className="flex items-start gap-3">
          {/* Icon với gradient */}
          <div className={`w-11 h-11 rounded-xl ${gradientClass} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
            <IconComponent className="w-5 h-5 text-white" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title row với badges */}
            <div className="flex items-center gap-2 mb-1">
              {entry.isPinned && (
                <span className="text-amber-500 animate-pulse">
                  <Pin className="w-3.5 h-3.5" />
                </span>
              )}
              {entry.isFavorite && (
                <span className="text-red-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </span>
              )}
              <h4 className="font-medium truncate flex-1 text-foreground">
                {entry.topic}
              </h4>
            </div>
            
            {/* Meta info */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {time}
              </span>
              {entry.durationMinutes && (
                <span>{entry.durationMinutes} phút</span>
              )}
              {entry.numSpeakers && entry.type === 'listening' && (
                <span>{entry.numSpeakers} người</span>
              )}
            </div>
          </div>

          {/* Play button với hover effect */}
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0 rounded-full opacity-70 hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all"
            onClick={(e) => { e.stopPropagation(); onOpen?.(entry); }}
          >
            <Play className="w-4 h-4" />
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}

/**
 * EmptyState - Hiển thị khi chưa có hoạt động
 */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center py-12"
    >
      <div className="relative inline-block mb-4">
        {/* Animated background */}
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <Calendar className="w-10 h-10 text-primary" />
        </div>
      </div>
      <h3 className="font-display font-semibold text-lg mb-2">Chưa có hoạt động</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto">
        Bắt đầu học để xem lịch sử hoạt động của bạn tại đây
      </p>
    </motion.div>
  );
}

/**
 * ActivityTimeline - Component chính
 */
export function ActivityTimeline({ 
  maxItems = 5, 
  onViewAll, 
  onOpenEntry 
}: ActivityTimelineProps) {
  const { history, loading, pagination } = useHistory({ status: 'all' });

  // Nhóm entries theo ngày
  const groupedHistory = useMemo(() => {
    const limitedHistory = history.slice(0, maxItems);
    return groupEntriesByDate(limitedHistory);
  }, [history, maxItems]);

  // Loading state với skeleton animation
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-4 pl-14 relative">
            <div className="absolute left-3.5 top-4 w-3 h-3 rounded-full bg-muted animate-pulse" />
            <div className="flex-1 h-20 bg-muted/20 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (history.length === 0) {
    return <EmptyState />;
  }

  const dateGroups = Object.entries(groupedHistory);
  let itemIndex = 0;

  return (
    <div className="relative">
      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none rounded-2xl" />
      
      <AnimatePresence mode="popLayout">
        {dateGroups.map(([date, entries], groupIndex) => (
          <div key={date} className="mb-6 last:mb-0">
            <DateHeader label={date} isFirst={groupIndex === 0} />
            
            {entries.map((entry, entryIndex) => {
              const currentIndex = itemIndex++;
              return (
                <TimelineItem
                  key={entry.id}
                  entry={entry}
                  index={currentIndex}
                  isLast={groupIndex === dateGroups.length - 1 && entryIndex === entries.length - 1}
                  onOpen={onOpenEntry}
                />
              );
            })}
          </div>
        ))}
      </AnimatePresence>

      {/* View All button */}
      {pagination.total > maxItems && onViewAll && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Button
            variant="outline"
            onClick={onViewAll}
            className="group relative overflow-hidden border-primary/30 hover:border-primary/60"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
            <span className="relative z-10">
              Xem tất cả {pagination.total} hoạt động
            </span>
          </Button>
        </motion.div>
      )}
    </div>
  );
}

export default ActivityTimeline;
