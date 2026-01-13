'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

/**
 * Auth Context Interface
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 *
 * Mục đích: Quản lý trạng thái authentication cho toàn app
 * Khi nào sử dụng: Wrap ở root layout, sau ThemeProvider
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    // Lấy session hiện tại
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Lắng nghe thay đổi auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Đăng nhập bằng Google OAuth
   * 
   * Mục đích: Xử lý đăng nhập qua Google OAuth
   * Tham số đầu vào: Không có
   * Tham số đầu ra: Promise<void>
   * Khi nào sử dụng: Khi user click nút "Đăng nhập với Google"
   */
  const signInWithGoogle = async () => {
    // Lấy base URL từ biến môi trường hoặc fallback về window.location.origin
    // Điều này cho phép cấu hình redirect URL khác nhau giữa dev và production
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
      },
    });

    if (error) {
      console.error('Lỗi đăng nhập Google:', error.message);
    }
  };

  /**
   * Đăng xuất
   */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Lỗi đăng xuất:', error.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook để sử dụng auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
