import { AuthProvider } from "@/components/providers/auth-provider"
import { GlobalAudioProvider } from "@/components/providers/global-audio-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layouts/app-sidebar"
import { AppHeader } from "@/components/layouts/app-header"
import { GlobalAudioPlayer, AudioChangeDialog } from "@/components/shared"

/**
 * MainLayout - Layout chính cho các trang app
 * 
 * STRUCTURE:
 * - SidebarInset là flex container với flex-col
 * - Main content có flex-1 overflow-auto → co lại khi player hiện
 * - GlobalAudioPlayer ở cuối như footer → không che content
 * 
 * Khi player active → content shrink, player slide up
 * Khi player inactive → content expand, player slide down
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <GlobalAudioProvider>
        {/* Guest Mode: Không redirect, cho phép xem nội dung */}
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="flex flex-col h-svh overflow-hidden">
            <AppHeader />
            {/* Main content - shrinks when player is visible */}
            <main className="flex-1 p-4 md:p-6 overflow-auto min-h-0">
              {children}
            </main>
            {/* Global Audio Player - Layout Footer, slides up/down */}
            <GlobalAudioPlayer />
          </SidebarInset>
        </SidebarProvider>
        
        <AudioChangeDialog />
      </GlobalAudioProvider>
    </AuthProvider>
  )
}


