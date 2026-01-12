'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Headphones, Mic, BookOpen, PenTool } from 'lucide-react';

/**
 * MobileNavBar - Bottom Navigation cho mobile
 *
 * Mục đích: Navigation chính trên mobile (thay thế Sidebar)
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị cố định ở bottom, chỉ trên mobile (< 1024px)
 */

// Danh sách các mục navigation
const navItems = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: Home,
    href: '/',
  },
  {
    id: 'listening',
    label: 'Nghe',
    icon: Headphones,
    href: '/listening',
  },
  {
    id: 'speaking',
    label: 'Nói',
    icon: Mic,
    href: '/speaking',
  },
  {
    id: 'reading',
    label: 'Đọc',
    icon: BookOpen,
    href: '/reading',
  },
  {
    id: 'writing',
    label: 'Viết',
    icon: PenTool,
    href: '/writing',
  },
];

export function MobileNavBar() {
  const pathname = usePathname();

  return (
    <nav 
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.href === '/' 
            ? pathname === '/' 
            : pathname.startsWith(item.href);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px] rounded-lg transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <IconComponent 
                className={cn(
                  'w-5 h-5 transition-transform',
                  isActive && 'scale-110'
                )} 
              />
              <span className={cn(
                'text-[10px] font-medium',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
              
              {/* Indicator dot khi active */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
