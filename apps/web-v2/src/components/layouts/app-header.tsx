"use client"

import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useAuth } from "@/components/providers/auth-provider"

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/listening": "Listening",
  "/speaking": "Speaking",
  "/reading": "Reading",
  "/history": "History",
  "/settings": "Settings",
}

export function AppHeader() {
  const pathname = usePathname()
  const { user } = useAuth()

  const currentLabel = routeLabels[pathname] || "Page"
  const isHome = pathname === "/"

  const avatarUrl = user?.user_metadata?.avatar_url || ""
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User"
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      {/* Left: Sidebar Trigger + Breadcrumb */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
        <div className="h-4 w-px bg-border mx-1 hidden sm:block" />
        
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            {!isHome && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium">{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile: Show current page name */}
        <span className="sm:hidden font-medium text-sm truncate">{currentLabel}</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 hidden sm:flex"
          aria-label="Search"
        >
          <Search className="size-4" />
        </Button>

        <ThemeToggle />

        {/* Mobile Avatar (visible on small screens only, since sidebar hides) */}
        <div className="sm:hidden">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
