'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Headphones, Mic, BookOpen, PenTool, GraduationCap, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Sidebar - Navigation menu component (Updated để match reference)
 *
 * Mục đích: Hiển thị navigation menu với 4 kỹ năng chính
 * Features: Bilingual labels, colored icons, green active state
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Menu items với icons và bilingual labels (VN / EN)
  const menuItems = [
    {
      id: 'listening',
      nameVi: 'Nghe',
      nameEn: 'Listening',
      icon: Headphones,
      href: '/listening',
      iconBg: 'bg-blue-500',
    },
    {
      id: 'speaking',
      nameVi: 'Nói',
      nameEn: 'Speaking',
      icon: Mic,
      href: '/speaking',
      iconBg: 'bg-green-500',
    },
    {
      id: 'reading',
      nameVi: 'Đọc',
      nameEn: 'Reading',
      icon: BookOpen,
      href: '/reading',
      iconBg: 'bg-purple-500',
    },
    {
      id: 'writing',
      nameVi: 'Viết',
      nameEn: 'Writing',
      icon: PenTool,
      href: '/writing',
      iconBg: 'bg-orange-500',
    },
  ];

  return (
    <>
      {/* Desktop Sidebar - Enhanced với aurora gradient và glow effects */}
      <aside
        className={cn(
          'hidden lg:flex flex-col transition-all duration-300',
          'sidebar-enhanced sidebar-glow-border',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-foreground">StudyLanguage</h1>
                <p className="text-xs text-muted-foreground">Study Smart</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const IconComponent = item.icon;
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  'menu-item-glow',
                  isActive
                    ? 'active-rainbow-glow text-white'
                    : 'hover:bg-accent/50 text-foreground'
                )}
                title={isCollapsed ? item.nameVi : undefined}
              >
                {/* Icon với nền màu và hiệu ứng float */}
                <div
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                    'icon-float',
                    isActive 
                      ? 'bg-white/20' 
                      : item.iconBg
                  )}
                >
                  <IconComponent 
                    className={cn(
                      'w-5 h-5',
                      isActive ? 'text-white' : 'text-white'
                    )} 
                  />
                </div>
                
                {/* Bilingual Labels */}
                {!isCollapsed && (
                  <div className="flex flex-col min-w-0">
                    <span className={cn(
                      'font-semibold text-sm',
                      isActive ? 'text-white' : 'text-foreground'
                    )}>
                      {item.nameVi}
                    </span>
                    <span className={cn(
                      'text-xs',
                      isActive ? 'text-white/70' : 'text-muted-foreground'
                    )}>
                      {item.nameEn}
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - User Profile */}
        {user && !isCollapsed && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold shadow-md">
                {user.email?.[0].toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Collapse Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 p-3 m-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-colors text-sm"
          title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </aside>

      {/* Mobile: Không cần sidebar slide-in, đã có MobileNavBar ở bottom */}
    </>
  );
}
