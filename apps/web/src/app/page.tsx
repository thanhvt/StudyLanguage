'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Headphones, Mic, BookOpen, PenTool, Sparkles, TrendingUp, ArrowRight, History } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/animations';
import { GradientText } from '@/components/ui/glass-card';
import { AppLayout } from '@/components/layouts/app-layout';
import { Card } from '@/components/ui/card';
import { ActivityTimeline, HistoryDrawer } from '@/components/history';

/**
 * Home Page - Dashboard chính
 *
 * Mục đích: Trang chủ với Quick Start cho 3 kỹ năng (UI cải tiến từ StudyMate Hub)
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Root page của app, làm dashboard chính
 */
export default function HomePage() {
  const { t } = useLanguage();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Danh sách 3 kỹ năng chính với icons và gradients từ StudyMate Hub
  const skills = [
    {
      id: 'listening',
      name: 'Nghe',
      nameEn: 'Listening',
      icon: Headphones,
      description: 'Luyện nghe với các hội thoại thực tế được tạo bởi AI, có transcript và phát âm chuẩn.',
      href: '/listening',
      gradientClass: 'skill-card-listening',
    },
    {
      id: 'speaking',
      name: 'Nói',
      nameEn: 'Speaking',
      icon: Mic,
      description: 'Hội thoại 1-1 với AI Coach, nhận phản hồi về phát âm và ngữ pháp ngay lập tức.',
      href: '/speaking',
      gradientClass: 'skill-card-speaking',
    },
    {
      id: 'reading',
      name: 'Đọc',
      nameEn: 'Reading',
      icon: BookOpen,
      description: 'Bài đọc theo chủ đề với từ điển tích hợp và câu hỏi đọc hiểu tương tác.',
      href: '/reading',
      gradientClass: 'skill-card-reading',
    },
  ];

  return (
    <AppLayout>
      <>
        {/* Hero Section - Enhanced */}
        <FadeIn delay={0.1}>
          <div className="text-center mb-12">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6 border border-primary/20">
              <Sparkles className="w-4 h-4" />
              <span>Học tiếng Anh cùng AI</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="text-foreground">Chào mừng bạn!</span>
              <br />
              <GradientText>Hãy bắt đầu học 🚀</GradientText>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Làm chủ tiếng Anh với công nghệ AI tiên tiến. Luyện tập 3 kỹ năng 
              Nghe - Nói - Đọc - Viết một cách hiệu quả và thú vị.
            </p>
          </div>
        </FadeIn>

        {/* Stats Bar */}
        <FadeIn delay={0.3}>
          <div className="glass-card p-4 mb-10 flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                <strong className="text-foreground">4</strong> kỹ năng
              </span>
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm text-muted-foreground">
              <strong className="text-foreground">AI</strong> hỗ trợ học tập
            </div>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="text-sm text-muted-foreground">
              Học <strong className="text-foreground">mọi lúc, mọi nơi</strong>
            </div>
          </div>
        </FadeIn>

        {/* Quick Start - 4 Skills Grid (Enhanced từ Live Reference) */}
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {skills.map((skill) => {
            const IconComponent = skill.icon;
            return (
              <StaggerItem key={skill.id}>
                <Link href={skill.href}>
                  <Card className="h-full cursor-pointer group p-6 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border/50">
                    <div className="flex items-start gap-4">
                      {/* Icon với gradient background */}
                      <div className={`w-14 h-14 rounded-2xl ${skill.gradientClass} flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-2">
                          <h3 className="font-display text-xl font-bold">{skill.name}</h3>
                          <span className="text-sm text-muted-foreground">{skill.nameEn}</span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">{skill.description}</p>
                        
                        {/* CTA Link - như reference */}
                        <span className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                          Bắt đầu học
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        {/* Activity Timeline Section */}
        <FadeIn delay={0.6}>
          <div className="mt-12">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <History className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">Hoạt động gần đây</h2>
                  <p className="text-sm text-muted-foreground">Tiếp tục từ lần học trước</p>
                </div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1 group"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            {/* Timeline */}
            <Card className="p-6 border border-border/50">
              <ActivityTimeline 
                maxItems={5}
                onViewAll={() => setIsHistoryOpen(true)}
              />
            </Card>
          </div>
        </FadeIn>

        {/* Bottom CTA / Tip */}
        <FadeIn delay={0.8}>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Mẹo: Học đều đặn mỗi ngày 15-30 phút để đạt kết quả tốt nhất
            </p>
          </div>
        </FadeIn>

        {/* History Drawer */}
        <HistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
        />
      </>
    </AppLayout>
  );
}
