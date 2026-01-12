'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { cn } from '@/lib/utils';
import { useState } from 'react';

/**
 * Sidebar - Navigation menu component
 * 
 * Mục đích: Hiển thị navigation menu với 4 kỹ năng chính
 * Tham số đầu vào: Không có props (sử dụng hooks để lấy data)
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Được sử dụng trong AppLayout, hiển thị ở tất cả pages
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu items cho 4 kỹ năng chính
  const menuItems = [
    {
      id: 'listening',
      name: t('skill.listening.name'),
      icon: '🎧',
      href: '/listening',
    },
    {
      id: 'speaking',
      name: t('skill.speaking.name'),
      icon: '🎤',
      href: '/speaking',
    },
    {
      id: 'reading',
      name: t('skill.reading.name'),
      icon: '📖',
      href: '/reading',
    },
    {
      id: 'writing',
      name: t('skill.writing.name'),
      icon: '✍️',
      href: '/writing',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col border-r glass-card border-border transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-60'
        )}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold">{t('app.title')}</h1>
                <p className="text-xs text-muted-foreground">Study Smart</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  'hover:bg-accent/10',
                  isActive && 'bg-primary text-primary-foreground shadow-md',
                  !isActive && 'text-foreground'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="text-xl">{item.icon}</span>
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - User Profile */}
        {user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 m-2 text-muted-foreground hover:text-foreground hover:bg-accent/10 rounded-lg transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="text-lg">{isCollapsed ? '→' : '←'}</span>
        </button>
      </aside>

      {/* Mobile Sidebar - Slide-in overlay */}
      <div className="lg:hidden">
        {/* TODO: Implement mobile sidebar với slide-in animation */}
        {/* Sẽ implement sau với hamburger menu button */}
      </div>
    </>
  );
}
