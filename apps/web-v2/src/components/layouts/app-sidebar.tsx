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
  User,
  Flame,
  Sparkles,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Menu items with skill colors and background tints
const mainNav = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    colorClass: "text-primary",
    bgClass: "bg-primary/10",
    glowClass: "shadow-primary/20",
  },
  {
    title: "Listening",
    url: "/listening",
    icon: Headphones,
    colorClass: "text-skill-listening",
    bgClass: "bg-skill-listening/10",
    glowClass: "shadow-skill-listening/20",
  },
  {
    title: "Speaking",
    url: "/speaking",
    icon: Mic,
    colorClass: "text-skill-speaking",
    bgClass: "bg-skill-speaking/10",
    glowClass: "shadow-skill-speaking/20",
  },
  {
    title: "Reading",
    url: "/reading",
    icon: BookOpen,
    colorClass: "text-skill-reading",
    bgClass: "bg-skill-reading/10",
    glowClass: "shadow-skill-reading/20",
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

// Get greeting based on time of day
function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning! ☀️"
  if (hour < 18) return "Good afternoon! 🌤️"
  return "Good evening! 🌙"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

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
    <Sidebar 
      collapsible="icon" 
      {...props} 
      className="bg-gradient-to-b from-sidebar via-sidebar to-sidebar/95 shadow-xl border-r-0"
    >
      {/* Premium Header with Gradient Logo */}
      <SidebarHeader className="border-b border-border/30 pb-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-3 group">
              {/* Gradient Animated Logo */}
              <div className="relative flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-indigo-500 to-violet-600 text-white shadow-lg shadow-primary/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-primary/40">
                <Sparkles className="size-5 transition-transform group-hover:rotate-12" />
                {/* Shimmer overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity" />
              </div>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-bold text-lg bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">StudyLanguage</span>
                <span className="text-xs text-muted-foreground">{mounted ? getGreeting() : "Welcome!"}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Quick Stats Card */}
      <div className="px-3 py-4 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-orange-500/10 via-orange-400/5 to-transparent p-3 border border-orange-200/30 dark:border-orange-500/20">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center size-8 rounded-lg bg-orange-500/20">
              <Flame className="size-4 text-orange-500 fill-orange-500 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Streak</span>
              <span className="text-lg font-bold tabular-nums">12 days</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Today</span>
            <span className="text-sm font-semibold text-primary">2/3 goals</span>
          </div>
        </div>
      </div>
      
      <SidebarContent className="px-2 group-data-[collapsible=icon]:px-1">
        {/* Learning Section - Card Style Nav */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 group-data-[collapsible=icon]:hidden">
            Learn
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-1">
            <SidebarMenu className="space-y-2">
              {mainNav.map((item) => {
                const isActive = pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive} 
                      tooltip={item.title}
                      className={cn(
                        "h-12 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:h-12 group-data-[collapsible=icon]:w-12 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center",
                        isActive && `${item.bgClass} shadow-lg ${item.glowClass} ring-1 ring-inset`,
                        isActive && item.colorClass.replace("text-", "ring-") + "/30",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                        <div className={cn(
                          "flex items-center justify-center size-9 rounded-lg transition-all group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:bg-transparent",
                          isActive ? `${item.bgClass}` : "bg-muted/30"
                        )}>
                          <item.icon className={cn(
                            "size-5 group-data-[collapsible=icon]:size-6", 
                            item.colorClass,
                            !isActive && "opacity-70 group-data-[collapsible=icon]:opacity-100"
                          )} />
                        </div>
                        <span className={cn(
                          "font-medium group-data-[collapsible=icon]:hidden",
                          isActive && "font-semibold"
                        )}>{item.title}</span>
                        {/* Active indicator dot */}
                        {isActive && (
                          <div className={cn("ml-auto size-2 rounded-full group-data-[collapsible=icon]:hidden", item.colorClass.replace("text-", "bg-"))} />
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
        <div className="mx-4 my-2 h-px bg-border/50 group-data-[collapsible=icon]:mx-2" />

        {/* Personal Section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2 group-data-[collapsible=icon]:hidden">
            Personal
          </SidebarGroupLabel>
          <SidebarGroupContent className="px-1">
            <SidebarMenu className="space-y-2">
              {secondaryNav.map((item) => {
                const isActive = pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      className={cn(
                        "h-10 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:justify-center",
                        isActive && "bg-muted shadow-sm",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
                        <item.icon className="size-5 text-muted-foreground group-data-[collapsible=icon]:size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      {/* Premium Footer */}
      <SidebarFooter className="border-t border-border/30 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            {loading ? (
              <div className="flex items-center gap-3 p-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="space-y-1.5 group-data-[collapsible=icon]:hidden">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="h-14 rounded-xl data-[state=open]:bg-accent/50 hover:bg-accent/30 transition-all"
                  >
                    <Avatar className="h-10 w-10 rounded-xl ring-2 ring-border/50">
                      <AvatarImage src={avatarUrl} alt={displayName} />
                      <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold">{displayName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {displayEmail}
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-xl"
                  side="top"
                  align="start"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-3 px-2 py-3 text-left text-sm">
                      <Avatar className="h-10 w-10 rounded-xl">
                        <AvatarImage src={avatarUrl} alt={displayName} />
                        <AvatarFallback className="rounded-xl bg-gradient-to-br from-primary to-indigo-600 text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{displayName}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {displayEmail}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-lg">
                      <User className="mr-2 size-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg">
                      <Settings className="mr-2 size-4" />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <LogOut className="mr-2 size-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* Rail removed to prevent icon overlap in collapsed state */}
    </Sidebar>
  )
}
