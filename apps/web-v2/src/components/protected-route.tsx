'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallbackUrl?: string;
}

/**
 * ProtectedRoute Component
 *
 * Purpose: Protect pages that require authentication
 * Parameters:
 *   - children: Page content to protect
 *   - fallbackUrl: URL to redirect when not logged in (default: /login)
 * When to use: Wrap pages/layouts that need auth like /profile, /history
 */
export function ProtectedRoute({ children, fallbackUrl = '/login' }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return;

    // If not logged in, redirect with return URL
    if (!user) {
      const redirectUrl = new URL(fallbackUrl, window.location.origin);
      redirectUrl.searchParams.set('redirectTo', pathname);
      router.push(redirectUrl.toString());
    }
  }, [user, loading, router, fallbackUrl, pathname]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="size-12 text-primary animate-spin relative" />
          </div>
          <p className="text-muted-foreground animate-pulse">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Don't render content if not logged in
  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to check if user is authenticated
 * 
 * Returns:
 *   - user: Current user or null
 *   - loading: Whether auth check is in progress
 *   - isAuthenticated: Boolean indicating if user is logged in
 */
export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      const url = new URL(redirectUrl, window.location.origin);
      url.searchParams.set('redirectTo', pathname);
      router.push(url.toString());
    }
  }, [user, loading, router, redirectUrl, pathname]);

  return { user, loading, isAuthenticated: !!user };
}
