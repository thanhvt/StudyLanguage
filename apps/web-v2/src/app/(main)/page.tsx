"use client"

import { useState } from "react"
import { GuestDashboard } from "@/components/dashboard/guest-dashboard"
import { AuthDashboard } from "@/components/dashboard/auth-dashboard"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function Home() {
  // Mock auth state for demo - In production, use actual auth state
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  return (
    <>
      {/* Demo Toggle - Remove in production */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 p-3 rounded-lg bg-card border shadow-lg">
        <Label htmlFor="auth-toggle" className="text-xs text-muted-foreground">
          Guest
        </Label>
        <Switch
          id="auth-toggle"
          checked={isAuthenticated}
          onCheckedChange={setIsAuthenticated}
        />
        <Label htmlFor="auth-toggle" className="text-xs text-muted-foreground">
          Auth
        </Label>
      </div>

      {/* Dashboard Content */}
      {isAuthenticated ? <AuthDashboard /> : <GuestDashboard />}
    </>
  )
}
