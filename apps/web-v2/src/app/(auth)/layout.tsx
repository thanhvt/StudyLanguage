import { AuthProvider } from "@/components/providers/auth-provider"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {/* Auth pages render without sidebar */}
      {children}
    </AuthProvider>
  )
}
