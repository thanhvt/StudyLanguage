'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/providers/language-provider';
import { PageTransition, FadeIn, StaggerChildren, StaggerItem } from '@/components/animations';
import { GlassCard, GradientText } from '@/components/ui/glass-card';
import { AppLayout } from '@/components/layouts/app-layout';

/**
 * Home Page - Dashboard chính
 *
 * Mục đích: Trang chủ với Quick Start cho 4 kỹ năng
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Root page của app, làm dashboard chính
 */
export default function HomePage() {
  const { t } = useLanguage();

  // Danh sách 4 kỹ năng chính
  const skills = [
    {
      id: 'listening',
      name: t('skill.listening.name'),
      icon: '🎧',
      description: t('skill.listening.desc'),
      href: '/listening',
      gradient: 'from-blue-500 to-cyan-400',
    },
    {
      id: 'speaking',
      name: t('skill.speaking.name'),
      icon: '🎤',
      description: t('skill.speaking.desc'),
      href: '/speaking',
      gradient: 'from-green-500 to-emerald-400',
    },
    {
      id: 'reading',
      name: t('skill.reading.name'),
      icon: '📖',
      description: t('skill.reading.desc'),
      href: '/reading',
      gradient: 'from-purple-500 to-pink-400',
    },
    {
      id: 'writing',
      name: t('skill.writing.name'),
      icon: '✍️',
      description: t('skill.writing.desc'),
      href: '/writing',
      gradient: 'from-orange-500 to-amber-400',
    },
  ];

  return (
    <AppLayout>
      <PageTransition>
        {/* Welcome Section */}
        <FadeIn delay={0.1}>
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3">
              Welcome back! <GradientText>Let's learn</GradientText> 🚀
            </h1>
            <p className="text-muted-foreground text-lg">
              {t('app.subtitle')}
            </p>
          </div>
        </FadeIn>

        {/* Quick Start - 4 Skills Grid */}
        <StaggerChildren staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      </PageTransition>
    </AppLayout>
  );
}
