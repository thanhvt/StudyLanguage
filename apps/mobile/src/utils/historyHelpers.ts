/**
 * Mục đích: Utility functions cho History module
 * Tham số đầu vào: Các giá trị cần format (date, type...)
 * Tham số đầu ra: Chuỗi đã format
 * Khi nào sử dụng: Được gọi từ HistoryScreen, HistoryCard, StatsBar
 *   để format dữ liệu hiển thị trên UI
 */

export type SkillType = 'listening' | 'speaking';

/**
 * Mục đích: Lấy icon emoji cho từng loại bài học
 * Tham số đầu vào: type - Loại bài học (listening/speaking)
 * Tham số đầu ra: Emoji tương ứng
 * Khi nào sử dụng: HistoryCard → hiển thị icon bên cạnh title
 */
export function getTypeIcon(type: SkillType): string {
  const icons: Record<SkillType, string> = {
    listening: '🎧',
    speaking: '🗣️',
  };
  return icons[type] || '📚';
}

/**
 * Mục đích: Lấy label tiếng Việt cho từng loại bài học
 * Tham số đầu vào: type - Loại bài học
 * Tham số đầu ra: Label tiếng Việt
 * Khi nào sử dụng: FilterPills, HistoryCard → hiển thị label
 */
export function getTypeLabel(type: SkillType): string {
  const labels: Record<SkillType, string> = {
    listening: 'Nghe',
    speaking: 'Nói',
  };
  return labels[type] || type;
}

/**
 * Mục đích: Lấy màu accent cho từng loại bài học (consistent với Dashboard)
 * Tham số đầu vào: type - Loại bài học
 * Tham số đầu ra: Object chứa border, bg, text color
 * Khi nào sử dụng: HistoryCard → accent border + badge styling
 */
export function getAccentColor(type: SkillType) {
  const colors: Record<SkillType, {border: string; bg: string; text: string}> =
    {
      listening: {
        border: '#4F46E5',
        bg: 'rgba(79, 70, 229, 0.1)',
        text: '#4F46E5',
      },
      speaking: {
        border: '#16A34A',
        bg: 'rgba(22, 163, 74, 0.1)',
        text: '#16A34A',
      },
    };
  return colors[type] || colors.listening;
}

/**
 * Mục đích: Format thời gian tương đối (relative time)
 * Tham số đầu vào: dateString - ISO date string
 * Tham số đầu ra: Chuỗi tiếng Việt (vd: "5 phút trước", "Hôm qua")
 * Khi nào sử dụng: HistoryCard → hiển thị thời gian bên dưới title
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);

  // EC-M06 fix: Xử lý date string không hợp lệ
  if (isNaN(date.getTime())) {
    return 'Không xác định';
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // EC-M07 fix: Ngày trong tương lai
  if (diffMs < 0) {
    return 'Sắp tới';
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Vừa xong';
  }
  if (diffMins < 60) {
    return `${diffMins} phút trước`;
  }
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }
  if (diffDays < 7) {
    return `${diffDays} ngày trước`;
  }

  return date.toLocaleDateString('vi-VN');
}

/**
 * Mục đích: Nhóm entries theo ngày (Hôm nay, Hôm qua, Tuần này, hoặc tháng)
 * Tham số đầu vào: dateString - ISO date string
 * Tham số đầu ra: Chuỗi nhóm ngày tiếng Việt
 * Khi nào sử dụng: HistoryScreen → SectionList header cho mỗi nhóm ngày
 */
export function formatDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const entryDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (entryDate.getTime() === today.getTime()) {
    return 'Hôm nay';
  }
  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Hôm qua';
  }
  if (entryDate > weekAgo) {
    return 'Tuần này';
  }

  return date.toLocaleDateString('vi-VN', {month: 'long', year: 'numeric'});
}

/**
 * Mục đích: Nhóm danh sách entries theo ngày để dùng cho SectionList
 * Tham số đầu vào: entries - Mảng HistoryEntry (đã sort mới → cũ)
 * Tham số đầu ra: Mảng sections {title, data[]}
 * Khi nào sử dụng: HistoryScreen → tạo data cho SectionList
 */
export function groupEntriesByDate<T extends {createdAt: string}>(
  entries: T[],
): {title: string; data: T[]}[] {
  const groups: Map<string, T[]> = new Map();

  for (const entry of entries) {
    const groupKey = formatDateGroup(entry.createdAt);
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(entry);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({title, data}));
}
