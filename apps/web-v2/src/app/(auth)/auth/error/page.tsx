"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, RefreshCw, Mail } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

// Error messages for different error codes
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  access_denied: {
    title: "Access Denied",
    description: "You denied access to your Google account. Please try again and allow access to continue.",
  },
  expired: {
    title: "Link Expired",
    description: "This authentication link has expired. Please try logging in again.",
  },
  invalid_request: {
    title: "Invalid Request",
    description: "There was a problem with the login request. Please try again.",
  },
  server_error: {
    title: "Server Error",
    description: "An unexpected error occurred on our servers. Please try again later.",
  },
  default: {
    title: "Authentication Failed",
    description: "We couldn't complete the sign-in process. Please try again.",
  },
}

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get("error") || "default"
  const errorInfo = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES.default

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Visual Section */}
      <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-destructive/10 via-background to-orange-500/10 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        </div>

        <div className="max-w-md text-center z-10 space-y-8">
          {/* Error Icon */}
          <div className="flex justify-center mb-6">
            <div className="size-24 rounded-2xl bg-destructive/10 border-2 border-destructive/20 flex items-center justify-center shadow-2xl relative">
              <div className="absolute inset-0 rounded-2xl bg-destructive/5 blur-xl animate-pulse" />
              <AlertTriangle className="size-12 text-destructive relative" />
            </div>
          </div>
          
          <h1 className="text-4xl font-display font-bold leading-tight">
            Oops! <span className="text-destructive">Something</span> went wrong
          </h1>
          <p className="text-lg text-muted-foreground">
            Don&apos;t worry, these things happen. Let&apos;s get you back on track.
          </p>
        </div>
      </div>

      {/* Right: Error Details Section */}
      <div className="flex flex-col justify-center items-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-2xl border-border/50">
          <CardHeader className="text-center space-y-4">
            {/* Mobile Icon */}
            <div className="flex justify-center lg:hidden mb-2">
              <div className="size-16 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-lg">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
            </div>
            
            <CardTitle className="text-2xl font-display text-destructive">
              {errorInfo.title}
            </CardTitle>
            <CardDescription className="text-base">
              {errorInfo.description}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Primary Action */}
            <Link href="/login" className="block">
              <Button 
                size="lg" 
                className="w-full h-12 text-base font-medium gap-2"
              >
                <RefreshCw className="size-4" />
                Try Again
              </Button>
            </Link>

            {/* Secondary Action */}
            <Link href="/" className="block">
              <Button 
                variant="outline"
                size="lg" 
                className="w-full h-12 text-base font-medium gap-2"
              >
                <ArrowLeft className="size-4" />
                Back to Home
              </Button>
            </Link>

            {/* Help Section */}
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm text-center text-muted-foreground">
                Still having issues?{" "}
                <a 
                  href="mailto:support@studylanguage.app" 
                  className="text-primary hover:underline inline-flex items-center gap-1"
                >
                  <Mail className="size-3" />
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Error Code Footer */}
        {errorCode !== "default" && (
          <p className="mt-4 text-xs text-muted-foreground/60">
            Error code: {errorCode}
          </p>
        )}
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}
