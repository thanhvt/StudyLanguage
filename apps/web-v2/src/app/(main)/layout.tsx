import { AuthProvider } from "@/components/providers/auth-provider"
import { GlobalAudioProvider } from "@/components/providers/global-audio-provider"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layouts/app-sidebar"
import { AppHeader } from "@/components/layouts/app-header"
import { GlobalAudioPlayer, AudioChangeDialog } from "@/components/shared"

/**
 * MainLayout - Layout chính cho các trang app
 * 
 * CHANGED: Bỏ ProtectedRoute wrapper để cho phép Guest xem tất cả pages
 * Protection được chuyển sang action-level qua AuthActionGuard component
 * 
 * ADDED: GlobalAudioProvider và GlobalAudioPlayer để audio persist across pages
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
          <SidebarInset>
            <AppHeader />
            <main className="flex-1 p-4 md:p-6 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
        
        {/* Global Audio Player - persists across pages */}
        <GlobalAudioPlayer />
        <AudioChangeDialog />
      </GlobalAudioProvider>
    </AuthProvider>
  )
}

