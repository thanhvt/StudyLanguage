'use client';

import Link from 'next/link';
import { Headphones, Mic, BookOpen, PenTool, Sparkles, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/components/providers/language-provider';
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from '@/components/animations';
import { GlassCard, GradientText } from '@/components/ui/glass-card';
import { AppLayout } from '@/components/layouts/app-layout';

/**
 * Home Page - Dashboard chính
 *
 * Mục đích: Trang chủ với Quick Start cho 4 kỹ năng (UI cải tiến từ StudyMate Hub)
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Root page của app, làm dashboard chính
 */
export default function HomePage() {
  const { t } = useLanguage();

  // Danh sách 4 kỹ năng chính với icons và gradients từ StudyMate Hub
  const skills = [
    {
      id: 'listening',
      name: t('skill.listening.name'),
      nameEn: 'Listening',
      icon: Headphones,
      description: t('skill.listening.desc'),
      href: '/listening',
      gradientClass: 'skill-card-listening',
    },
    {
      id: 'speaking',
      name: t('skill.speaking.name'),
      nameEn: 'Speaking',
      icon: Mic,
      description: t('skill.speaking.desc'),
      href: '/speaking',
      gradientClass: 'skill-card-speaking',
    },
    {
      id: 'reading',
      name: t('skill.reading.name'),
      nameEn: 'Reading',
      icon: BookOpen,
      description: t('skill.reading.desc'),
      href: '/reading',
      gradientClass: 'skill-card-reading',
    },
    {
      id: 'writing',
      name: t('skill.writing.name'),
      nameEn: 'Writing',
      icon: PenTool,
      description: t('skill.writing.desc'),
      href: '/writing',
      gradientClass: 'skill-card-writing',
    },
  ];

  return (
    <AppLayout>
      <PageTransition>
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
              Làm chủ tiếng Anh với công nghệ AI tiên tiến. Luyện tập 4 kỹ năng 
              Nghe - Nói - Đọc - Viết một cách hiệu quả và thú vị.
            </p>
          </div>
        </FadeIn>

        {/* Stats Bar */}
        <FadeIn delay={0.3}>
          <GlassCard className="p-4 mb-10 flex items-center justify-center gap-8 flex-wrap">
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
          </GlassCard>
        </FadeIn>

        {/* Quick Start - 4 Skills Grid (Enhanced từ StudyMate Hub) */}
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {skills.map((skill) => {
            const IconComponent = skill.icon;
            return (
              <StaggerItem key={skill.id}>
                <Link href={skill.href}>
                  <GlassCard 
                    variant="default" 
                    hover="lift"
                    className="h-full cursor-pointer group p-6"
                  >
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
                        <p className="text-muted-foreground text-sm leading-relaxed">{skill.description}</p>
                      </div>
                    </div>
                  </GlassCard>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerChildren>

        {/* Bottom CTA / Tip */}
        <FadeIn delay={0.8}>
          <div className="mt-12 text-center">
            <p className="text-sm text-muted-foreground">
              💡 Mẹo: Học đều đặn mỗi ngày 15-30 phút để đạt kết quả tốt nhất
            </p>
          </div>
        </FadeIn>
      </PageTransition>
    </AppLayout>
  );
}
