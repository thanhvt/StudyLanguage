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
      {/* NEW: Music Player Section - Compact Design */}
      {currentTrack && (
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900/40 via-purple-900/10 to-transparent border border-white/10 rounded-2xl p-3 shadow-xl backdrop-blur-md group">
          {/* Subtle animated background glow */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
          
          <div className="relative z-10">
            {/* Header / Track Info */}
            <div className="flex items-center gap-3 mb-3">
               <div className={cn(
                 "w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg border border-white/10 relative overflow-hidden", 
                 isPlaying ? "shadow-[0_0_15px_rgba(139,92,246,0.5)]" : "bg-white/5"
               )}>
                 <div className={cn("absolute inset-0 bg-gradient-to-br from-violet-600 to-indigo-600 opacity-80", !isPlaying && "opacity-0")} />
                 <span className="relative z-10 text-sm">{isPlaying ? '🎧' : '🎵'}</span>
               </div>
               
               <div className="flex-1 min-w-0 flex flex-col justify-center">
                 <p className="text-xs font-bold truncate text-white tracking-wide">{currentTrack.name}</p>
                 <p className="text-[10px] text-white/50 font-medium uppercase tracking-wider">Background Music</p>
               </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between px-3 mb-3">
               {/* Prev Button */}
               <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={prevTrack}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-back"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" x2="5" y1="19" y2="5"/></svg>
               </Button>
               
               {/* Play/Pause Button - Compact Focus */}
               <Button 
                  onClick={toggle} 
                  className={cn(
                    "h-12 w-12 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.3)] transition-all active:scale-95 flex items-center justify-center border border-white/20",
                    isPlaying 
                      ? "bg-white text-indigo-900 hover:bg-white/90" 
                      : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white hover:brightness-110"
                  )}
               >
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-0.5"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="ml-1"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  )}
               </Button>

               {/* Next Button */}
               <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={nextTrack}
                  className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-skip-forward"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/></svg>
               </Button>
            </div>

            {/* Volume */}
            <div className="bg-black/20 rounded-xl p-2 flex items-center gap-2 backdrop-blur-sm border border-white/5 mx-1">
               <div className="w-4 h-4 flex items-center justify-center">
                 {volume === 0 ? (
                    <span className="text-white/40 text-[10px]">🔇</span>
                 ) : volume < 0.5 ? (
                    <span className="text-white/60 text-[10px]">🔉</span> 
                 ) : (
                    <span className="text-white/80 text-[10px]">🔊</span>
                 )}
               </div>
               <div className="relative flex-1 h-5 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {/* Custom Track */}
                  <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" 
                      style={{ width: `${volume * 100}%` }}
                    />
                  </div>
                  {/* Thumb Indicator (Visual only) */}
                  <div 
                    className="absolute h-2.5 w-2.5 bg-white rounded-full shadow-md pointer-events-none transition-all duration-75"
                    style={{ left: `calc(${volume * 100}% - 5px)` }}
                  />
               </div>
            </div>

            {isDucking && (
              <p className="text-[9px] text-amber-300 text-center mt-1.5 animate-pulse font-medium tracking-wide">
                 Voice Active...
              </p>
            )}
          </div>
        </div>
      )}

      {/* 1. User Profile Enhanced (Commented Out by User) - Hidden if empty to prevent spacing issues */}
      {/* 
        NOTE: The original code had an empty container here when user content was commented out. 
        I'm hiding it to fix the double gap issue.
      */}
      {/* <div className={cn("hidden", "flex flex-col items-center ...")}> ... </div> */}

      {/* <div className="glow-divider my-1" /> */}

      {/* 2. Motivation Stats (Streak) */}
      {user && (
        <div className="stat-card-neon rounded-2xl p-4 flex items-center justify-between">
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
      {user && (
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
      )}
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
