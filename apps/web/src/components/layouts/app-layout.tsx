'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { RightPanel } from './right-panel';

/**
 * AppLayout - Layout wrapper cho toàn bộ app
 * 
 * Mục đích: Cung cấp 3-column layout (Sidebar + Content + Right Panel)
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
      {/* Sidebar trái - 240px cố định trên desktop, collapse trên mobile */}
      <Sidebar />

      {/* Main content area - flex grow */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Right panel - 320px cố định trên desktop, ẩn trên mobile */}
      <RightPanel />
    </div>
  );
}
