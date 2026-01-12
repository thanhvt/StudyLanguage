'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { ThemeSwitcher } from '@/components/theme-switcher';

/**
 * Home Page - Dashboard chính
 *
 * Mục đích: Trang chủ với Quick Start cho 4 kỹ năng
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
      color: 'bg-blue-500',
    },
    {
      id: 'speaking',
      name: 'Luyện Nói',
      icon: '🎤',
      description: 'Luyện phát âm với AI Coach',
      href: '/speaking',
      color: 'bg-green-500',
    },
    {
      id: 'reading',
      name: 'Luyện Đọc',
      icon: '📖',
      description: 'Đọc hiểu với câu hỏi AI',
      href: '/reading',
      color: 'bg-purple-500',
    },
    {
      id: 'writing',
      name: 'Luyện Viết',
      icon: '✍️',
      description: 'Viết và nhận phản hồi từ AI',
      href: '/writing',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">📚 AI Learning</h1>
          
          <div className="flex items-center gap-4">
            {loading ? (
              <span className="text-muted-foreground">Đang tải...</span>
            ) : user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm">{user.email}</span>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Đăng xuất
                </Button>
              </div>
            ) : (
              <Button onClick={signInWithGoogle}>
                🔑 Đăng nhập với Google
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold mb-3">
            Smart AI Learning 🚀
          </h2>
          <p className="text-muted-foreground text-lg">
            Luyện 4 kỹ năng: Nghe, Nói, Đọc, Viết với trợ lý AI thông minh
          </p>
        </div>

        {/* Quick Start - 4 Skills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {skills.map((skill) => (
            <Link key={skill.id} href={skill.href}>
              <Card className="p-6 h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <div className={`w-16 h-16 rounded-full ${skill.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {skill.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{skill.name}</h3>
                <p className="text-muted-foreground text-sm">{skill.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <div className="max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-3 text-center">⚙️ Cài đặt giao diện</h3>
          <ThemeSwitcher />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          AI Learning © 2026 - Powered by AI
        </div>
      </footer>
    </div>
  );
}
