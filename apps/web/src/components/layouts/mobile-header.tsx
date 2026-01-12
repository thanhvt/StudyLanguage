'use client';

import Link from 'next/link';
import { useState } from 'react';
import { GraduationCap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useAuth } from '@/components/providers/auth-provider';

/**
 * MobileHeader - Header cho mobile
 *
 * Mục đích: Hiển thị branding và settings button trên mobile
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element  
 * Khi nào sử dụng: Hiển thị fixed ở top, chỉ trên mobile (< 1024px)
 */
export function MobileHeader() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, signOut, signInWithGoogle } = useAuth();

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-foreground">StudyLanguage</span>
        </Link>

        {/* Settings Sheet */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle>Cài đặt</SheetTitle>
            </SheetHeader>
            
            <div className="mt-6 space-y-6">
              {/* User Info */}
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
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
                  <Button variant="outline" size="sm" onClick={signOut} className="w-full">
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <Button onClick={signInWithGoogle} className="w-full">
                  Đăng nhập với Google
                </Button>
              )}

              <div className="h-px bg-border" />

              {/* Theme Switcher */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Giao diện</h3>
                <ThemeSwitcher />
              </div>

              <div className="h-px bg-border" />

              {/* Language Switcher */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Ngôn ngữ</h3>
                <LanguageSwitcher />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
