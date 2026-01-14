'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Headphones, Mic, BookOpen, PenTool } from 'lucide-react';
import { useState, useMemo } from 'react';

/**
 * MobileNavBar - Bottom Navigation cho mobile với Style C: Mixed Shapes
 *
 * Mục đích: Navigation chính trên mobile với design hiện đại
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị cố định ở bottom, chỉ trên mobile (< 1024px)
 * 
 * Style C Features:
 * - Home: Hình tròn lớn ở giữa, nổi lên
 * - 4 Skills: Rounded squares với màu riêng cho từng skill
 * - Animated curved gradient indicator - lượn lên tại tab active
 * - Animations: Bounce, glow, ripple effects
 */

// Skill colors theo theme đã có trong globals.css
const skillColors = {
  home: {
    bg: 'hsl(152, 76%, 40%)',
    gradient: 'linear-gradient(135deg, hsl(152, 76%, 45%), hsl(180, 70%, 40%))',
  },
  listening: {
    bg: 'hsl(200, 90%, 50%)',
    bgLight: 'hsl(200, 90%, 95%)',
    bgDark: 'hsl(200, 90%, 20%)',
    gradient: 'linear-gradient(135deg, hsl(200, 90%, 50%), hsl(180, 80%, 45%))',
  },
  speaking: {
    bg: 'hsl(152, 76%, 40%)',
    bgLight: 'hsl(152, 76%, 95%)',
    bgDark: 'hsl(152, 76%, 20%)',
    gradient: 'linear-gradient(135deg, hsl(152, 76%, 40%), hsl(160, 70%, 35%))',
  },
  reading: {
    bg: 'hsl(280, 70%, 55%)',
    bgLight: 'hsl(280, 70%, 95%)',
    bgDark: 'hsl(280, 70%, 25%)',
    gradient: 'linear-gradient(135deg, hsl(280, 70%, 55%), hsl(320, 70%, 55%))',
  },
  writing: {
    bg: 'hsl(35, 90%, 55%)',
    bgLight: 'hsl(35, 90%, 95%)',
    bgDark: 'hsl(35, 90%, 25%)',
    gradient: 'linear-gradient(135deg, hsl(35, 90%, 55%), hsl(45, 90%, 50%))',
  },
};

// Thứ tự tabs và vị trí % tương ứng (0-100)
const tabPositions: Record<string, { position: number; color: typeof skillColors.listening }> = {
  listening: { position: 10, color: skillColors.listening },
  speaking: { position: 30, color: skillColors.speaking },
  home: { position: 50, color: skillColors.home },
  reading: { position: 70, color: skillColors.reading },
  writing: { position: 90, color: skillColors.writing },
};

// Danh sách các mục navigation - Home ở giữa
const leftNavItems = [
  {
    id: 'listening',
    label: 'Nghe',
    icon: Headphones,
    href: '/listening',
    color: skillColors.listening,
  },
  {
    id: 'speaking',
    label: 'Nói',
    icon: Mic,
    href: '/speaking',
    color: skillColors.speaking,
  },
];

const rightNavItems = [
  {
    id: 'reading',
    label: 'Đọc',
    icon: BookOpen,
    href: '/reading',
    color: skillColors.reading,
  },
  {
    id: 'writing',
    label: 'Viết',
    icon: PenTool,
    href: '/writing',
    color: skillColors.writing,
  },
];

const homeItem = {
  id: 'home',
  label: 'Home',
  icon: Home,
  href: '/',
};

// Component cho skill tabs (rounded squares) - FIX: mở rộng vùng click
function SkillNavItem({ 
  item, 
  isActive 
}: { 
  item: typeof leftNavItems[0]; 
  isActive: boolean;
}) {
  const [isPressed, setIsPressed] = useState(false);
  const IconComponent = item.icon;

  return (
    <Link
      href={item.href}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 transition-all duration-300',
        // FIX: Mở rộng vùng click - chiếm toàn bộ không gian
        'flex-1 min-h-[64px] py-2'
      )}
    >
      {/* Rounded square container cho icon - FIX: thêm pointer-events-none để click xuyên qua */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-xl transition-all duration-300 pointer-events-none',
          'w-11 h-11',
          isActive && 'scale-110',
          isPressed && 'scale-95'
        )}
        style={{
          background: isActive ? item.color.gradient : 'transparent',
          boxShadow: isActive 
            ? `0 4px 15px ${item.color.bg}40, 0 0 20px ${item.color.bg}30` 
            : 'none',
        }}
      >
        {/* Icon */}
        <IconComponent 
          className={cn(
            'w-5 h-5 transition-all duration-300',
            isActive ? 'text-white' : 'text-muted-foreground'
          )}
          strokeWidth={isActive ? 2.5 : 2}
        />
        
        {/* Ripple effect khi press */}
        {isPressed && (
          <span 
            className="absolute inset-0 rounded-xl animate-ping opacity-30"
            style={{ background: item.color.bg }}
          />
        )}
      </div>

      {/* Label - FIX: thêm pointer-events-none */}
      <span 
        className={cn(
          'text-[10px] font-medium transition-all duration-300 pointer-events-none',
          isActive ? 'font-semibold' : 'text-muted-foreground'
        )}
        style={{ color: isActive ? item.color.bg : undefined }}
      >
        {item.label}
      </span>
    </Link>
  );
}

// Component cho Home button (hình tròn lớn ở giữa)
function HomeNavItem({ isActive }: { isActive: boolean }) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <Link
      href={homeItem.href}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => setIsPressed(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      // FIX: Mở rộng vùng click và căn chỉnh tốt hơn
      className="relative flex flex-col items-center justify-end flex-1 min-h-[64px] pb-2"
    >
      {/* Vòng tròn nền với gradient */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all duration-300 pointer-events-none',
          'w-14 h-14 border-4 border-background -mt-4',
          isActive && 'scale-110',
          isPressed && 'scale-100'
        )}
        style={{
          background: isActive 
            ? 'linear-gradient(135deg, hsl(152, 76%, 45%), hsl(180, 70%, 40%))'
            : 'linear-gradient(135deg, hsl(152, 76%, 36%), hsl(160, 70%, 35%))',
          boxShadow: isActive 
            ? '0 6px 25px hsla(152, 76%, 45%, 0.5), 0 0 30px hsla(152, 76%, 45%, 0.3)'
            : '0 4px 15px hsla(152, 76%, 36%, 0.3)',
        }}
      >
        {/* Icon Home */}
        <Home 
          className={cn(
            'w-6 h-6 text-white transition-all duration-300',
            isActive && 'animate-pulse'
          )}
          strokeWidth={2.5}
        />
        
        {/* Glow ring animation khi active */}
        {isActive && (
          <span 
            className="absolute inset-0 rounded-full animate-ping opacity-20"
            style={{ background: 'hsl(152, 76%, 45%)' }}
          />
        )}

        {/* Ripple khi press */}
        {isPressed && (
          <span 
            className="absolute inset-0 rounded-full animate-ping opacity-40"
            style={{ background: 'white' }}
          />
        )}
      </div>

      {/* Label Home */}
      <span 
        className={cn(
          'text-[10px] font-semibold mt-0.5 transition-all duration-300 pointer-events-none',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {homeItem.label}
      </span>
    </Link>
  );
}

// Component cho curved gradient indicator - LƯỢN LÊN tại tab active
function CurvedIndicator({ activeTab }: { activeTab: string }) {
  const tabInfo = tabPositions[activeTab] || tabPositions.home;
  
  // Tạo SVG path cong lên tại vị trí active - SMOOTHER VERSION
  const createCurvedPath = (activePosition: number) => {
    // activePosition: 0-100 (%)
    // Tạo đường cong mượt hơn với nhiều control points và độ rộng lớn hơn
    const width = 100;
    const height = 24; // Tăng chiều cao để đường cong rõ hơn
    const peakX = activePosition;
    
    // Điểm bắt đầu (góc trái) - hơi cao hơn bottom
    const startY = height - 2;
    // Điểm cao nhất (tại active tab) - đỉnh của đường cong
    const peakY = 4;
    // Điểm kết thúc (góc phải)
    const endY = height - 2;
    
    // Tạo smooth bezier curve với control points rộng hơn
    // Sử dụng 2 đoạn cubic bezier để tạo đường cong mượt mà hơn
    const curveWidth = 35; // Độ rộng của phần cong (tăng từ 25 lên 35)
    const smoothness = 20; // Độ mượt của transition (tăng từ 15 lên 20)
    
    // Control points cho đoạn từ start đến peak
    const cp1X = Math.max(0, peakX - curveWidth);
    const cp1Y = startY;
    const cp2X = Math.max(0, peakX - smoothness);
    const cp2Y = peakY + 2; // Thêm offset nhỏ để mượt hơn
    
    // Control points cho đoạn từ peak đến end
    const cp3X = Math.min(width, peakX + smoothness);
    const cp3Y = peakY + 2;
    const cp4X = Math.min(width, peakX + curveWidth);
    const cp4Y = endY;
    
    return `M 0 ${startY} 
            C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${peakX} ${peakY}
            C ${cp3X} ${cp3Y}, ${cp4X} ${cp4Y}, ${width} ${endY}`;
  };
  
  return (
    <div className="absolute -top-3 left-0 right-0 h-6 overflow-visible pointer-events-none">
      <svg 
        viewBox="0 0 100 20" 
        preserveAspectRatio="none"
        className="w-full h-full"
        style={{ filter: `drop-shadow(0 0 8px ${tabInfo.color.bg})` }}
      >
        {/* Gradient definition */}
        <defs>
          <linearGradient id={`curveGradient-${activeTab}`} x1="0%" y1="0%" x2="100%" y2="0%">
            {/* Chỉ hiển thị phần gần peak, fade out hoàn toàn ở xa */}
            <stop offset="0%" stopColor={tabInfo.color.bg} stopOpacity="0" />
            <stop offset={`${Math.max(0, tabInfo.position - 25)}%`} stopColor={tabInfo.color.bg} stopOpacity="0" />
            <stop offset={`${Math.max(0, tabInfo.position - 15)}%`} stopColor={tabInfo.color.bg} stopOpacity="0.6" />
            <stop offset={`${tabInfo.position}%`} stopColor={tabInfo.color.bg} stopOpacity="1" />
            <stop offset={`${Math.min(100, tabInfo.position + 15)}%`} stopColor={tabInfo.color.bg} stopOpacity="0.6" />
            <stop offset={`${Math.min(100, tabInfo.position + 25)}%`} stopColor={tabInfo.color.bg} stopOpacity="0" />
            <stop offset="100%" stopColor={tabInfo.color.bg} stopOpacity="0" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        {/* Main curved path - animated */}
        <path
          d={createCurvedPath(tabInfo.position)}
          fill="none"
          stroke={`url(#curveGradient-${activeTab})`}
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#glow)"
          className="transition-all duration-500 ease-out"
        />
        
        {/* Bright dot at the peak */}
        <circle
          cx={tabInfo.position}
          cy="2"
          r="3"
          fill={tabInfo.color.bg}
          className="transition-all duration-500 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${tabInfo.color.bg})` }}
        />
      </svg>
    </div>
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
    if (pathname.startsWith('/writing')) return 'writing';
    return 'home';
  }, [pathname]);

  return (
    <nav 
      className={cn(
        'lg:hidden fixed bottom-0 left-0 right-0 z-50',
        // Background transparent để không có viền
        'bg-transparent backdrop-blur-sm'
      )}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Curved gradient indicator - lượn lên tại tab active */}
      <CurvedIndicator activeTab={activeTab} />

      <div className="flex items-stretch h-16">
        {/* Left side - Nghe, Nói */}
        {leftNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <SkillNavItem 
              key={item.id} 
              item={item} 
              isActive={isActive}
            />
          );
        })}

        {/* Center - Home button (elevated) */}
        <HomeNavItem isActive={pathname === '/'} />

        {/* Right side - Đọc, Viết */}
        {rightNavItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <SkillNavItem 
              key={item.id} 
              item={item} 
              isActive={isActive}
            />
          );
        })}
      </div>
    </nav>
  );
}
