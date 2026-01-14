'use client';

import { useAuth } from '@/components/providers/auth-provider';
import { useLanguage } from '@/components/providers/language-provider';
import { useTheme } from '@/components/providers/theme-provider';
import { useMusic } from '@/components/providers/music-provider';
import { Button } from '@/components/ui/button';
import { 
  User, Sun, Moon, Monitor, 
  Flame, Target, CheckCircle2, 
  Zap, Settings, Sparkles, Trophy, 
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * RightPanel - Motivation Station (Trạm tiếp năng lượng)
 *
 * Mục đích: Giữ chân người học bằng Gamification & Quick Access
 * Layout: Enhanced Glassmorphism Panel
 */
export function RightPanel() {
  return (
    <aside className={cn(
      "hidden xl:flex w-80 flex-col gap-5 p-5 h-screen sticky top-0",
      "panel-enhanced panel-glow-border border-l border-border/40 backdrop-blur-xl"
    )}>
      <RightPanelContent />
    </aside>
  );
}

export function RightPanelContent() {
  const { user, signOut, signInWithGoogle } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  
  // Music Hook
  const { 
    isPlaying, 
    volume, 
    currentTrack, 
    isDucking,
    toggle, 
    setVolume, 
    nextTrack, 
    prevTrack 
  } = useMusic();

  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Mock Data cho Gamification
  const userLevel = 5;
  const userXP = 65; // %
  const currentStreak = 12;
  
  const dailyGoals = [
    { id: 1, text: 'Hoàn thành 1 bài Nghe', completed: true },
    { id: 2, text: 'Luyện nói 5 phút', completed: false },
    { id: 3, text: 'Học 10 từ vựng mới', completed: false },
  ];

  return (
    <>
      {/* 1. User Profile Enhanced */}
      <div className="flex flex-col items-center text-center space-y-3 pt-1">
         {user ? (
          <>
            <div className="relative">
              {/* Avatar Glow Ring */}
              {/* <div className="w-20 h-20 rounded-full avatar-glow p-1 bg-background/50 backdrop-blur-md">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden shadow-inner">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.email?.[0].toUpperCase() || 'U'
                  )}
                </div>
              </div> */}
              
              {/* Level Badge */}
              {/* <div className="absolute -bottom-2 md:left-1/2 md:-translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-white/20 whitespace-nowrap">
                LV. {userLevel} Scholar
              </div> */}
            </div>

            {/* <div className="space-y-1 w-full">
              <h3 className="font-bold text-lg truncate px-2">
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </h3>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-4">
                <span>XP</span>
                <div className="h-2 flex-1 bg-muted/50 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full shadow-[0_0_10px_hsl(var(--primary))]" 
                    style={{ width: `${userXP}%` }}
                  />
                </div>
                <span>{userXP}%</span>
              </div>
            </div> */}
          </>
        ) : (
          <div className="text-center space-y-4 w-full">
             <div className="w-20 h-20 mx-auto rounded-full bg-muted/30 flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                <User className="w-8 h-8 text-muted-foreground" />
             </div>
             <div className="space-y-2">
               <h3 className="font-semibold">Tham gia ngay!</h3>
               <p className="text-xs text-muted-foreground px-2">Đăng nhập để lưu tiến độ và đua top.</p>
             </div>
             <Button onClick={signInWithGoogle} className="w-full rounded-xl shadow-lg shadow-primary/20">
               <Sparkles className="w-4 h-4 mr-2" />
               Đăng nhập với Google
             </Button>
          </div>
        )}
      </div>

      {/* <div className="glow-divider my-1" /> */}

      {/* NEW: Music Player Section */}
      {currentTrack && (
        <div className="bg-card/40 border border-border/40 rounded-2xl p-3 shadow-inner">
          <div className="flex items-center gap-3 mb-3">
             <div className={cn(
               "w-10 h-10 rounded-lg flex items-center justify-center text-xl shadow-md transition-all", 
               isPlaying ? "bg-primary/20 animate-pulse" : "bg-muted"
             )}>
               {isPlaying ? '🎧' : '🎶'}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-xs font-bold truncate text-primary">{currentTrack.name}</p>
               <p className="text-[10px] text-muted-foreground">Background Music</p>
             </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-1 mb-2">
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={prevTrack}>
               <span className="text-lg">⏮️</span>
             </Button>
             
             <Button 
                onClick={toggle} 
                className={cn(
                  "h-10 w-10 rounded-full shadow-lg transition-all active:scale-95",
                  isPlaying ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                )}
             >
                {isPlaying ? <span className="text-lg">⏸️</span> : <span className="text-lg ml-0.5">▶️</span>}
             </Button>

             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={nextTrack}>
               <span className="text-lg">⏭️</span>
             </Button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 px-1">
             <span className="text-[10px] opacity-70">🔈</span>
             <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer bg-muted/50 accent-primary"
              />
             <span className="text-[10px] opacity-70">🔊</span>
          </div>
          {isDucking && (
            <p className="text-[10px] text-amber-500 text-center mt-1 animate-pulse">
               AI đang nói (giảm âm lượng)
            </p>
          )}
        </div>
      )}

      {/* 2. Motivation Stats (Streak) */}
      {user && (
        <div className="stat-card-neon rounded-2xl p-4 flex items-center justify-between mt-2">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Chuỗi ngày</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white text-glow">{currentStreak}</span>
              <span className="text-xs text-muted-foreground">ngày</span>
            </div>
            <p className="text-[10px] text-green-400 mt-1 font-medium">Bạn đang làm rất tốt! 🔥</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
            <Flame className="w-6 h-6 text-orange-500 fill-orange-500 animate-pulse" />
          </div>
        </div>
      )}

      {/* 3. Daily Goals */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-3 min-h-[150px]">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Mục tiêu hôm nay
          </h4>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">1/3</span>
        </div>

        <div className="space-y-2">
          {dailyGoals.map((goal) => (
            <div 
              key={goal.id}
              className={cn(
                "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-300",
                goal.completed 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-card/40 border-border/40 hover:bg-card/60"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center border transition-colors",
                goal.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-muted-foreground/30 group-hover:border-primary/50"
              )}>
                {goal.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <span className={cn(
                "text-sm flex-1",
                goal.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {goal.text}
              </span>
            </div>
          ))}
        </div>
        
        {/* Ad/Tip Box */}
         <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-violet-600/10 to-indigo-600/10 border border-indigo-500/20">
            <div className="flex gap-2">
               <Zap className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
               <p className="text-xs text-muted-foreground leading-relaxed">
                 <span className="text-indigo-400 font-bold">Mẹo:</span> Học vào cùng một khung giờ mỗi ngày giúp não bộ ghi nhớ tốt hơn 30%.
               </p>
            </div>
         </div>
      </div>
      <div className="glow-divider my-1" />
      {/* 4. Compact Footer (Settings) */}
      <div className="mt-auto space-y-2">
         {/* Theme Toggle */}
         <div className="flex bg-muted/30 rounded-lg p-1">
            <button 
              onClick={() => setTheme('light')}
              className={cn("flex-1 rounded-md py-1.5 flex items-center justify-center transition-all", theme === 'light' ? "bg-background shadow-sm text-amber-500" : "text-muted-foreground hover:text-foreground")}
              title="Sáng"
            >
              <Sun className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('dark')}
              className={cn("flex-1 rounded-md py-1.5 flex items-center justify-center transition-all", theme === 'dark' ? "bg-background shadow-sm text-indigo-400" : "text-muted-foreground hover:text-foreground")}
              title="Tối"
            >
              <Moon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setTheme('system')}
              className={cn("flex-1 rounded-md py-1.5 flex items-center justify-center transition-all", theme === 'system' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
              title="Hệ thống"
            >
              <Monitor className="w-4 h-4" />
            </button>
         </div>

         <div className="grid grid-cols-2 gap-2 pt-3">
           {/* Language Toggle */}
           <div className="flex bg-muted/30 rounded-lg p-1">
              <button 
                 onClick={() => setLanguage('vi')}
                 className={cn("flex-1 text-xs font-bold rounded-md transition-all", language === 'vi' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                VI
              </button>
              <button 
                 onClick={() => setLanguage('en')}
                 className={cn("flex-1 text-xs font-bold rounded-md transition-all", language === 'en' ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
              >
                EN
              </button>
           </div>
           
           {/* Logout Button */}
           {user && (
             <Button 
                variant="ghost" 
                size="sm" 
                onClick={signOut} 
                className="w-full h-full rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                title="Đăng xuất"
              >
               <LogOut className="w-4 h-4 mr-2" />
               {language === 'vi' ? 'Đăng xuất' : 'Exit'}
             </Button>
           )}
         </div>
      </div>
    </>
  );
}
