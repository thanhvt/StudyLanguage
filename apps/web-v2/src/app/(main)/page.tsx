"use client"

import { GuestDashboard } from "@/components/dashboard/guest-dashboard"
import { AuthDashboard } from "@/components/dashboard/auth-dashboard"
import { useAuth } from "@/components/providers/auth-provider"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  const { user, loading } = useAuth()
  const isAuthenticated = !!user

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <Skeleton className="md:col-span-3 h-48 rounded-xl" />
          <Skeleton className="md:col-span-1 h-48 rounded-xl" />
          <Skeleton className="md:col-span-4 h-32 rounded-xl" />
          <Skeleton className="md:col-span-2 h-64 rounded-xl" />
          <Skeleton className="md:col-span-1 h-64 rounded-xl" />
          <Skeleton className="md:col-span-1 h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  // Dashboard Content - switches based on auth state
  return isAuthenticated ? <AuthDashboard /> : <GuestDashboard />
}
