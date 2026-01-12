'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * ProtectedRoute Component
 *
 * Mục đích: Bảo vệ các trang yêu cầu đăng nhập
 * Tham số:
 *   - children: Nội dung trang cần bảo vệ
 *   - fallbackUrl: URL redirect khi chưa đăng nhập (default: /)
 * Khi nào sử dụng: Wrap các trang cần auth như /profile, /history
 */
export function ProtectedRoute({ children, fallbackUrl = '/' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ auth check xong
    if (loading) return;

    // Nếu chưa đăng nhập, redirect
    if (!user) {
      router.push(fallbackUrl);
    }
  }, [user, loading, router, fallbackUrl]);

  // Hiển thị loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  // Không hiển thị nội dung nếu chưa đăng nhập
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook để kiểm tra xem user đã đăng nhập chưa
 */
export function useRequireAuth(redirectUrl = '/') {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  return { user, loading, isAuthenticated: !!user };
}
