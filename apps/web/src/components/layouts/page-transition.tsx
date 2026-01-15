'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

/**
 * PageTransition - Component wrap content để tạo hiệu ứng chuyển trang
 *
 * Mục đích: Tạo hiệu ứng fade + slide mượt mà khi chuyển giữa các pages
 * Tham số đầu vào: children (ReactNode) - nội dung trang
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Wrap children trong AppLayout để có page transitions
 * 
 * Lưu ý: Animation chỉ trigger khi pathname thay đổi, KHÔNG trigger khi
 * children thay đổi (ví dụ khi user gõ vào input)
 */

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Chỉ trigger animation khi pathname THỰC SỰ thay đổi
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      
      // Trigger animation out
      setIsVisible(false);
      
      // Sau khi animation out hoàn thành, trigger animation in
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 150); // Thời gian cho animation out

      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <div
      className={cn(
        'transition-[opacity,transform] duration-300 ease-out',
        isVisible 
          ? 'opacity-100 translate-y-0 scale-100' 
          : 'opacity-0 translate-y-2 scale-[0.99]'
      )}
    >
      {children}
    </div>
  );
}
