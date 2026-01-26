import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { MusicProvider } from "@/components/providers/music-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { SettingsProvider } from "@/components/providers/settings-provider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyLanguage V2",
  description: "AI-Powered English Learning - Bento Zen Redesign",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <LanguageProvider>
              <MusicProvider>
                {children}
                <Toaster richColors position="top-right" />
              </MusicProvider>
            </LanguageProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
