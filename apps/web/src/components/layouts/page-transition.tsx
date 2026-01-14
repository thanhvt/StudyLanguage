'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * PageTransition - Component wrap content để tạo hiệu ứng chuyển trang
 *
 * Mục đích: Tạo hiệu ứng fade + slide mượt mà khi chuyển giữa các pages
 * Tham số đầu vào: children (ReactNode) - nội dung trang
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Wrap children trong AppLayout để có page transitions
 */

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    // Khi pathname thay đổi, trigger animation out
    setIsVisible(false);
    
    // Sau khi animation out hoàn thành, đổi content và trigger animation in
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setIsVisible(true);
    }, 150); // Thời gian cho animation out

    return () => clearTimeout(timer);
  }, [pathname, children]);

  return (
    <div
      className={cn(
        'transition-all duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-[0.99]'
      )}
    >
      {displayChildren}
    </div>
  );
}
