"use client"

import * as React from "react"
import {
  BookOpen,
  Headphones,
  LayoutDashboard,
  Mic,
  Settings,
  History,
  LogOut,
  LogIn,
  User,
  Sparkles,
  ChevronUp,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Volume2,
  Music,
  MessageSquarePlus,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useMusic } from "@/components/providers/music-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { FeedbackDialog } from "@/components/modules/feedback/feedback-dialog"

// Menu items - clean design with subtle colors
const mainNav = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Listening",
    url: "/listening",
    icon: Headphones,
  },
  {
    title: "Speaking",
    url: "/speaking",
    icon: Mic,
  },
  {
    title: "Reading",
    url: "/reading",
    icon: BookOpen,
  },
]

const secondaryNav = [
  {
    title: "History",
    url: "/history",
    icon: History,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

// Action-based menu items (opens dialog instead of navigating)
const actionNav = [
  {
    title: "Góp ý",
    action: "feedback",
    icon: MessageSquarePlus,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"
  const { 
    isPlaying, 
    volume, 
    currentTrack, 
    toggle, 
    setVolume, 
    nextTrack, 
    prevTrack,
    shuffleTrack 
  } = useMusic()

  // Feedback dialog state
  const [feedbackOpen, setFeedbackOpen] = React.useState(false)

  const handleLogout = async () => {
    await signOut()
    router.push("/login")
  }

  // User display info
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const displayEmail = user?.email || "user@example.com"
  const avatarUrl = user?.user_metadata?.avatar_url || ""
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <>
    <Sidebar 
      collapsible="icon" 
      {...props} 
      className="border-r border-sidebar-border bg-sidebar"
    >
      {/* Header - Logo */}
      <SidebarHeader className={cn("p-4", isCollapsed && "px-2")}>
        <SidebarMenu>
          <SidebarMenuItem className={cn(isCollapsed && "flex justify-center")}>
            <div className={cn(
              "flex items-center",
              isCollapsed ? "justify-center" : "gap-3"
            )}>
              {/* Logo Icon */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white shadow-sm">
                <Sparkles className="size-4" />
              </div>
              {/* Brand Name - hidden when collapsed */}
              {!isCollapsed && (
                <span className="font-semibold text-sidebar-foreground">
                  StudyLanguage
                </span>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className={cn("px-2", isCollapsed && "px-1")}>
        {/* Main Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
              Learn
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainNav.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title} className={cn(isCollapsed && "flex justify-center")}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-lg transition-colors",
                        isCollapsed && "w-10 justify-center px-0 mx-auto",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={item.url} className={cn(
                        "flex items-center gap-3",
                        isCollapsed && "justify-center w-full"
                      )}>
                        <item.icon className={cn(
                          "size-5 shrink-0 transition-colors",
                          isActive && "text-sidebar-primary"
                        )} />
                        {!isCollapsed && (
                          <span>{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Separator */}
        <div className={cn(
          "my-3 h-px bg-sidebar-border",
          isCollapsed ? "mx-2" : "mx-3"
        )} />

        {/* Secondary Navigation */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="px-3 text-xs font-medium uppercase tracking-wider text-sidebar-muted">
              Personal
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title} className={cn(isCollapsed && "flex justify-center")}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-lg transition-colors",
                        isCollapsed && "w-10 justify-center px-0 mx-auto",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )}
                    >
                      <Link href={item.url} className={cn(
                        "flex items-center gap-3",
                        isCollapsed && "justify-center w-full"
                      )}>
                        <item.icon className={cn(
                          "size-5 shrink-0 transition-colors",
                          isActive && "text-sidebar-primary"
                        )} />
                        {!isCollapsed && (
                          <span>{item.title}</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Action Navigation (Góp ý) */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {actionNav.map((item) => (
                <SidebarMenuItem key={item.title} className={cn(isCollapsed && "flex justify-center")}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => {
                      if (item.action === "feedback") {
                        setFeedbackOpen(true)
                      }
                    }}
                    className={cn(
                      "h-10 rounded-lg transition-colors cursor-pointer",
                      isCollapsed && "w-10 justify-center px-0 mx-auto",
                      "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    )}
                  >
                    <div className={cn(
                      "flex items-center gap-3",
                      isCollapsed && "justify-center w-full"
                    )}>
                      <item.icon className="size-5 shrink-0 transition-colors" />
                      {!isCollapsed && (
                        <span>{item.title}</span>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Footer - Music Controls + User Profile */}
      <SidebarFooter className={cn(
        "border-t border-sidebar-border",
        isCollapsed ? "px-1 py-2" : "p-3"
      )}>
        {/* Music Controls */}
        {!isCollapsed && currentTrack && (
          <div className="mb-3 p-2 rounded-lg bg-sidebar-accent/30">
            {/* Track Info */}
            <div className="flex items-center gap-2 mb-2">
              <div className="size-8 rounded-md bg-primary/20 flex items-center justify-center overflow-hidden">
                {isPlaying ? (
                  <div className="flex items-end gap-[2px] h-4 pb-1">
                    <div className="w-0.5 bg-primary animate-music-wave-1 rounded-full" />
                    <div className="w-0.5 bg-primary animate-music-wave-2 rounded-full" />
                    <div className="w-0.5 bg-primary animate-music-wave-3 rounded-full" />
                    <div className="w-0.5 bg-primary animate-music-wave-4 rounded-full" />
                  </div>
                ) : (
                  <Music className="size-4 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-sidebar-foreground">
                  {currentTrack.name}
                </p>
                <p className="text-[10px] text-sidebar-muted">Nhạc nền</p>
              </div>
            </div>
            
            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-1 mb-2">
              <button
                onClick={shuffleTrack}
                className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-muted hover:text-sidebar-foreground"
                title="Shuffle"
              >
                <Shuffle className="size-3.5" />
              </button>
              <button
                onClick={prevTrack}
                className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                title="Previous"
              >
                <SkipBack className="size-4" />
              </button>
              <button
                onClick={toggle}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isPlaying 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-sidebar-accent text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
              </button>
              <button
                onClick={nextTrack}
                className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-foreground"
                title="Next"
              >
                <SkipForward className="size-4" />
              </button>
              <button
                onClick={shuffleTrack}
                className="p-1.5 rounded-md hover:bg-sidebar-accent transition-colors text-sidebar-muted hover:text-sidebar-foreground opacity-0 pointer-events-none"
              >
                <Shuffle className="size-3.5" />
              </button>
            </div>
            
            {/* Volume Slider */}
            <div className="flex items-center gap-2">
              <Volume2 className="size-3.5 text-sidebar-muted shrink-0" />
              <Slider
                value={[volume]}
                onValueChange={([v]) => setVolume(v)}
                min={0}
                max={1}
                step={0.05}
                className="flex-1"
              />
              <span className="text-[10px] text-sidebar-muted w-7 text-right">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        )}
        
        {/* Collapsed: Music Toggle Button */}
        {isCollapsed && currentTrack && (
          <div className="flex justify-center mb-2">
            <button
              onClick={toggle}
              className={cn(
                "p-2 rounded-lg transition-colors",
                isPlaying 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-sidebar-accent text-sidebar-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              title={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
            </button>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem className={cn(isCollapsed && "flex justify-center")}>
            {loading ? (
              <div className={cn(
                "flex items-center gap-3",
                isCollapsed && "justify-center"
              )}>
                <Skeleton className="size-9 rounded-lg" />
                {!isCollapsed && (
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                )}
              </div>
            ) : user ? (
              // Authenticated User - Show dropdown menu
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className={cn(
                      "h-auto rounded-lg data-[state=open]:bg-sidebar-accent hover:bg-sidebar-accent/50 transition-colors",
                      isCollapsed ? "w-10 justify-center p-2 mx-auto" : "p-2"
                    )}
                  >
                    <Avatar className={cn(
                      "rounded-lg shrink-0",
                      isCollapsed ? "size-7" : "size-9"
                    )}>
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white text-sm font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    {!isCollapsed && (
                      <>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-medium text-sidebar-foreground">
                            {displayName}
                          </span>
                          <span className="truncate text-xs text-sidebar-muted">
                            {displayEmail}
                          </span>
                        </div>
                        <ChevronUp className="ml-auto size-4 text-sidebar-muted" />
                      </>
                    )}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[calc(var(--radix-dropdown-menu-trigger-width)_-_2px)] min-w-56 rounded-xl shadow-lg"
                  side="top"
                  align="start"
                  sideOffset={16}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-3 py-2.5 text-left text-sm">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{displayName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-lg gap-2 px-3 py-2">
                      <User className="size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg gap-2 px-3 py-2">
                      <Settings className="size-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="rounded-lg gap-2 px-3 py-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // Guest User - Show login button
              <SidebarMenuButton
                asChild
                size="lg"
                className={cn(
                  "h-auto rounded-lg hover:bg-sidebar-accent/50 transition-colors",
                  isCollapsed ? "w-10 justify-center p-2 mx-auto" : "p-2"
                )}
                tooltip="Đăng nhập"
              >
                <Link href="/login" className={cn(
                  "flex items-center",
                  isCollapsed ? "justify-center" : "gap-3"
                )}>
                  <div className={cn(
                    "flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-600 text-white shrink-0",
                    isCollapsed ? "size-7" : "size-9"
                  )}>
                    <LogIn className={cn(isCollapsed ? "size-3.5" : "size-4")} />
                  </div>
                  {!isCollapsed && (
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-sidebar-foreground">
                        Đăng nhập
                      </span>
                      <span className="truncate text-xs text-sidebar-muted">
                        Để lưu tiến trình học
                      </span>
                    </div>
                  )}
                </Link>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    {/* Feedback Dialog */}
    <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  )
}
