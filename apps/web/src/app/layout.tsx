import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { MusicProvider } from "@/components/providers/music-provider";
import { MusicControlBar } from "@/components/music-control-bar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyLanguage - Học Tiếng Anh với AI",
  description: "Ứng dụng học tiếng Anh 4 kỹ năng (Nghe, Nói, Đọc, Viết) tích hợp AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <MusicProvider>
              {children}
              <MusicControlBar />
            </MusicProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

