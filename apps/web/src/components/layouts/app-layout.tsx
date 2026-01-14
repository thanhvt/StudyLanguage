'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { RightPanel } from './right-panel';
import { MobileHeader } from './mobile-header';
import { MobileNavBar } from './mobile-nav';
import { PageTransition } from './page-transition';

/**
 * AppLayout - Layout wrapper cho toàn bộ app
 * 
 * Mục đích: Cung cấp responsive 3-column layout với page transitions
 * - Mobile (< 1024px): Header + Content + Bottom Nav
 * - Desktop (>= 1024px): Sidebar + Content + Right Panel
 * Tham số đầu vào: children (ReactNode) - nội dung chính
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Wrap tất cả các pages trong app (trừ auth pages)
 */
interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Header - chỉ hiện trên mobile */}
      <MobileHeader />

      {/* Sidebar trái - 240px cố định trên desktop, ẩn trên mobile */}
      <Sidebar />

      {/* Main content area - flex grow với responsive padding */}
      <main className="flex-1 overflow-y-auto pt-14 pb-24 lg:pt-0 lg:pb-0">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          {/* Page transition wrapper */}
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* Right panel - 320px cố định trên xl, ẩn trên nhỏ hơn */}
      <RightPanel />

      {/* Mobile Bottom Nav - chỉ hiện trên mobile */}
      <MobileNavBar />
    </div>
  );
}

