'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from '@/components/animations';
import { GlassCard, GradientText } from '@/components/ui/glass-card';

/**
 * Home Page - Dashboard chính
 *
 * Mục đích: Trang chủ với Quick Start cho 4 kỹ năng
 * NEW: Premium UI với animations và glassmorphism
 */
export default function HomePage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const skills = [
    {
      id: 'listening',
      name: 'Luyện Nghe',
      icon: '🎧',
      description: 'Nghe hội thoại AI tạo theo chủ đề',
      href: '/listening',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      id: 'speaking',
      name: 'Luyện Nói',
      icon: '🎤',
      description: 'Luyện phát âm với AI Coach',
      href: '/speaking',
      gradient: 'from-green-500 to-emerald-400',
    },
    {
      id: 'reading',
      name: 'Luyện Đọc',
      icon: '📖',
      description: 'Đọc hiểu với câu hỏi AI',
      href: '/reading',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      id: 'writing',
      name: 'Luyện Viết',
      icon: '✍️',
      description: 'Viết và nhận phản hồi từ AI',
      href: '/writing',
      gradient: 'from-orange-500 to-amber-400',
    },
  ];

  return (
    <div className="min-h-screen bg-background gradient-mesh">
      {/* Header */}
      <header className="border-b glass-card border-transparent">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            📚 <GradientText>AI Learning</GradientText>
          </h1>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-muted-foreground">Đang tải...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm hidden md:inline">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button onClick={signInWithGoogle} className="glow-button">
                🔑 Đăng nhập với Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <PageTransition>
          {/* Welcome */}
          <FadeIn delay={0.1}>
            <div className="text-center mb-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-3">
                Smart <GradientText>AI Learning</GradientText> 🚀
              </h2>
              <p className="text-muted-foreground text-lg">
                Luyện 4 kỹ năng: Nghe, Nói, Đọc, Viết với trợ lý AI thông minh
              </p>
            </div>
          </FadeIn>

          {/* Quick Start - 4 Skills */}
          <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {skills.map((skill) => (
              <StaggerItem key={skill.id}>
                <Link href={skill.href}>
                  <GlassCard 
                    variant="default" 
                    hover="lift"
                    className="h-full cursor-pointer group"
                  >
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${skill.gradient} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      {skill.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
                    <p className="text-muted-foreground text-sm">{skill.description}</p>
                  </GlassCard>
                </Link>
              </StaggerItem>
            ))}
          </StaggerChildren>

          {/* Settings */}
          <FadeIn delay={0.5}>
            <div className="max-w-md mx-auto">
              <GlassCard variant="default" hover="none">
                <h3 className="text-lg font-semibold mb-3 text-center">⚙️ Cài đặt giao diện</h3>
                <ThemeSwitcher />
              </GlassCard>
            </div>
          </FadeIn>
        </PageTransition>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto glass-card border-transparent">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          AI Learning © 2026 - Powered by AI ✨
        </div>
      </footer>
    </div>
  );
}

