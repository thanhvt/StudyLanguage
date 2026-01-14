"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

/**
 * Sonner Toaster component với cấu hình mặc định
 * - Vị trí: góc trên bên phải (top-right)
 * - Thời gian tự động đóng: 30 giây
 * - Hỗ trợ dark/light theme
 */
const Toaster = ({ ...props }: React.ComponentProps<typeof Sonner>) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as "light" | "dark" | "system"}
      position="top-right"
      duration={30000} // 30 giây
      closeButton
      richColors
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl",
          title: "group-[.toast]:text-foreground group-[.toast]:font-semibold",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
