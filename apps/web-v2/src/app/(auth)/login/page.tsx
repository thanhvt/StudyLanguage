"use client"

import { useAuth } from "@/components/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Headphones, Mic, Sparkles, Loader2, CheckCircle2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { cn } from "@/lib/utils"

// Google Icon SVG component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  )
}

// Loading overlay component
function LoadingOverlay({ isRedirecting }: { isRedirecting: boolean }) {
  if (!isRedirecting) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative mx-auto">
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse scale-150" />
          
          {/* Spinning loader */}
          <div className="relative size-20 rounded-full border-4 border-border flex items-center justify-center">
            <Loader2 className="size-10 text-primary animate-spin" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-lg font-medium">Connecting to Google...</p>
          <p className="text-sm text-muted-foreground">
            Please complete the login in the popup window
          </p>
        </div>
      </div>
    </div>
  )
}

// Feature pill component with stagger animation
function FeaturePill({ 
  icon: Icon, 
  label, 
  color, 
  delay 
}: { 
  icon: typeof Headphones
  label: string
  color: string
  delay: number 
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-full px-4 py-2 shadow-sm",
        "opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className={cn("size-4", color)} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

function LoginContent() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isRedirecting, setIsRedirecting] = useState(false)
  
  // Get redirect URL from query params
  const redirectTo = searchParams.get("redirectTo") || "/"

  useEffect(() => {
    if (user && !loading) {
      // Add a small delay for smoother transition
      setIsRedirecting(true)
      const timer = setTimeout(() => {
        router.replace(redirectTo)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [user, loading, router, redirectTo])

  const handleSignIn = async () => {
    setIsRedirecting(true)
    try {
      await signInWithGoogle()
    } catch {
      setIsRedirecting(false)
    }
  }

  // Initial loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            <Loader2 className="size-12 text-primary animate-spin relative" />
          </div>
          <p className="text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    )
  }

  // Success state - user is logged in
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
            <CheckCircle2 className="size-12 text-green-500 relative" />
          </div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <LoadingOverlay isRedirecting={isRedirecting} />
      
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left: Hero/Branding Section */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-primary/10 via-background to-secondary/10 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03]">
            <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
          </div>

          {/* Floating decorative elements */}
          <div className="absolute top-20 left-20 size-32 rounded-full bg-primary/5 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 size-40 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

          <div className="max-w-md text-center z-10 space-y-8">
            {/* Logo with entrance animation */}
            <div 
              className="flex justify-center mb-6 opacity-0 animate-in fade-in zoom-in duration-500 fill-mode-forwards"
            >
              <div className="size-20 rounded-2xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/30 relative group">
                <div className="absolute inset-0 rounded-2xl bg-primary/50 blur-xl group-hover:blur-2xl transition-all opacity-50" />
                <Sparkles className="size-10 text-primary-foreground relative" />
              </div>
            </div>
            
            {/* Title with entrance animation */}
            <h1 
              className="text-4xl font-display font-bold leading-tight opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
              style={{ animationDelay: '100ms' }}
            >
              Learn English with <span className="text-primary">AI-Powered</span> Conversations
            </h1>
            
            {/* Subtitle */}
            <p 
              className="text-lg text-muted-foreground opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-forwards"
              style={{ animationDelay: '200ms' }}
            >
              Practice Listening, Speaking, and Reading with personalized content generated just for you.
            </p>

            {/* Feature Pills with stagger animation */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <FeaturePill icon={Headphones} label="Listening" color="text-blue-500" delay={300} />
              <FeaturePill icon={Mic} label="Speaking" color="text-green-500" delay={400} />
              <FeaturePill icon={BookOpen} label="Reading" color="text-purple-500" delay={500} />
            </div>
          </div>
        </div>

        {/* Right: Login Form Section */}
        <div className="flex flex-col justify-center items-center p-8 bg-background">
          <Card 
            className={cn(
              "w-full max-w-md shadow-2xl border-border/50",
              "opacity-0 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-forwards lg:slide-in-from-bottom-4"
            )}
            style={{ animationDelay: '200ms' }}
          >
            <CardHeader className="text-center space-y-2">
              {/* Mobile Logo */}
              <div className="flex justify-center lg:hidden mb-4">
                <div className="size-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                  <Sparkles className="size-7 text-primary-foreground" />
                </div>
              </div>
              <CardTitle className="text-2xl font-display">Welcome Back</CardTitle>
              <CardDescription>Sign in to continue your learning journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button
                onClick={handleSignIn}
                disabled={isRedirecting}
                variant="outline"
                size="lg"
                className={cn(
                  "w-full h-12 text-base font-medium gap-3",
                  "hover:bg-muted/50 hover:border-primary/50 transition-all duration-200",
                  "focus-visible:ring-primary/50"
                )}
              >
                {isRedirecting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <GoogleIcon className="size-5" />
                )}
                {isRedirecting ? "Connecting..." : "Continue with Google"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
