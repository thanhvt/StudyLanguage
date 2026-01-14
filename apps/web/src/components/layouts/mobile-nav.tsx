'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Headphones, Mic, BookOpen, PenTool } from 'lucide-react';
import { useMemo } from 'react';

/**
 * MobileNavBar - Dribbble-Style Morphing Tab Bar
 *
 * Mục đích: Navigation chính trên mobile với design morphing đẹp mắt
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị cố định ở bottom, chỉ trên mobile (< 1024px)
 * 
 * Features:
 * - Icon active nhô lên khỏi thanh nav
 * - Border màu đặc trưng cho từng tab
 * - Label chỉ hiển thị cho tab active
 * - Smooth CSS transitions
 */

// Skill colors theo theme
const tabConfig = {
  home: {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    color: 'hsl(152, 76%, 40%)',
    colorLight: 'hsl(152, 76%, 95%)',
    shape: 'pentagon', // Hình ngũ giác cho home
  },
  listening: {
    id: 'listening',
    label: 'Nghe',
    icon: Headphones,
    href: '/listening',
    color: 'hsl(200, 90%, 50%)',
    colorLight: 'hsl(200, 90%, 95%)',
    shape: 'circle',
  },
  speaking: {
    id: 'speaking',
    label: 'Nói',
    icon: Mic,
    href: '/speaking',
    color: 'hsl(152, 76%, 40%)',
    colorLight: 'hsl(152, 76%, 95%)',
    shape: 'circle',
  },
  reading: {
    id: 'reading',
    label: 'Đọc',
    icon: BookOpen,
    href: '/reading',
    color: 'hsl(280, 70%, 55%)',
    colorLight: 'hsl(280, 70%, 95%)',
    shape: 'rounded-square',
  },
};

// Thứ tự tabs
const tabOrder = ['listening', 'speaking', 'home', 'reading'] as const;

// Component cho mỗi tab
function NavTab({ 
  tabKey, 
  isActive 
}: { 
  tabKey: keyof typeof tabConfig;
  isActive: boolean;
}) {
  const config = tabConfig[tabKey];
  const IconComponent = config.icon;

  // Shape class cho active container
  const getShapeClass = () => {
    switch (config.shape) {
      case 'pentagon':
        return 'rounded-t-2xl rounded-b-xl'; // Giả lập pentagon với border-radius
      case 'circle':
        return 'rounded-full';
      case 'rounded-square':
        return 'rounded-xl';
      default:
        return 'rounded-xl';
    }
  };

  return (
    <Link
      href={config.href}
      className={cn(
        'relative flex flex-col items-center justify-center transition-all duration-300 ease-out',
        'flex-1 min-h-[64px]',
        // Khi active, cần thêm space cho phần nhô lên
        isActive ? 'z-10' : 'z-0'
      )}
    >
      {/* Container chính - nhô lên khi active */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center transition-all duration-300 ease-out',
          isActive ? '-translate-y-4' : 'translate-y-0'
        )}
      >
        {/* Icon container với shape và border */}
        <div
          className={cn(
            'relative flex items-center justify-center transition-all duration-300 ease-out',
            getShapeClass(),
            isActive ? 'w-14 h-14' : 'w-10 h-10'
          )}
          style={{
            backgroundColor: isActive ? 'var(--background)' : 'transparent',
            border: isActive ? `3px solid ${config.color}` : 'none',
            boxShadow: isActive 
              ? `0 4px 20px ${config.color}40, 0 0 30px ${config.color}20` 
              : 'none',
          }}
        >
          <IconComponent 
            className={cn(
              'transition-all duration-300 ease-out',
              isActive ? 'w-6 h-6' : 'w-5 h-5'
            )}
            style={{ 
              color: isActive ? config.color : 'var(--muted-foreground)',
              strokeWidth: isActive ? 2.5 : 1.5,
            }}
            fill={isActive ? config.color : 'none'}
          />
        </div>

        {/* Label - chỉ hiển thị khi active */}
        <span 
          className={cn(
            'text-[10px] font-semibold mt-1 transition-all duration-300 ease-out whitespace-nowrap',
            isActive 
              ? 'opacity-100 translate-y-0' 
              : 'opacity-0 -translate-y-2 pointer-events-none absolute'
          )}
          style={{ color: isActive ? config.color : undefined }}
        >
          {config.label}
        </span>
      </div>
    </Link>
  );
}

export function MobileNavBar() {
  const pathname = usePathname();
  
  // Xác định tab đang active
  const activeTab = useMemo(() => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/listening')) return 'listening';
    if (pathname.startsWith('/speaking')) return 'speaking';
    if (pathname.startsWith('/reading')) return 'reading';
    return 'home';
  }, [pathname]);

  return (
    <nav 
      className={cn(
        'lg:hidden fixed bottom-4 left-4 right-4 z-50',
        // Pill-shaped container
        'rounded-[15px]',
        // Background với backdrop blur
        'bg-card/95 dark:bg-card/90 backdrop-blur-xl',
        // Shadow
        'shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)]',
        'dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]',
        // Border subtle
        'border border-border/50'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center h-16 px-2">
        {tabOrder.map((tabKey) => (
          <NavTab
            key={tabKey}
            tabKey={tabKey}
            isActive={activeTab === tabKey}
          />
        ))}
      </div>
    </nav>
  );
}
