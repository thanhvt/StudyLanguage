'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { LogIn, Chrome } from "lucide-react";

/**
 * LoginPromptModal - Modal yêu cầu đăng nhập
 * 
 * Mục đích: Hiển thị khi guest user cố gắng sử dụng tính năng yêu cầu auth
 * 
 * Tham số đầu vào:
 * - open: Trạng thái hiển thị modal
 * - onOpenChange: Callback khi trạng thái thay đổi
 * - message: Tin nhắn tùy chỉnh (optional)
 * 
 * Tham số đầu ra: JSX Element
 * 
 * Khi nào sử dụng: Được gọi bởi AuthActionGuard hoặc useGuestAuth
 */
interface LoginPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function LoginPromptModal({ 
  open, 
  onOpenChange,
  message = "Đăng nhập để sử dụng tính năng này"
}: LoginPromptModalProps) {
  const { signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    await signInWithGoogle();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-4">
          {/* Icon với gradient background */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          
          <DialogTitle className="text-xl font-semibold">
            Yêu cầu đăng nhập
          </DialogTitle>
          
          <DialogDescription className="text-muted-foreground">
            {message}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-4">
          {/* Nút đăng nhập Google - Lớn và dễ nhấn theo Fitts' Law */}
          <Button 
            onClick={handleLogin}
            className="w-full h-12 gap-3 text-base font-medium"
            size="lg"
          >
            <Chrome className="w-5 h-5" />
            Đăng nhập bằng Google
          </Button>

          {/* Nút hủy - Secondary, nhỏ hơn */}
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full text-muted-foreground"
          >
            Để sau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
