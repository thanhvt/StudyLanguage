'use client';

import { cloneElement, isValidElement, ReactNode, ReactElement } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

/**
 * AuthActionGuard - Component wrapper bảo vệ các action yêu cầu auth
 * 
 * Mục đích: Wrap các button/interactive element để kiểm tra auth trước khi thực hiện
 * 
 * Tham số đầu vào:
 * - children: Button hoặc element cần bảo vệ
 * - message: Tin nhắn hiển thị trong toast (optional)
 * - onAuthRequired: Callback khi cần auth (optional)
 * 
 * Tham số đầu ra: JSX Element với logic auth guard
 * 
 * Khi nào sử dụng: Wrap quanh Button, các clickable element trong Listening/Speaking/Reading
 * 
 * Ví dụ:
 * <AuthActionGuard>
 *   <Button onClick={handleGenerate}>Generate</Button>
 * </AuthActionGuard>
 */
interface AuthActionGuardProps {
  children: ReactNode;
  message?: string;
  onAuthRequired?: () => void;
}

export function AuthActionGuard({ 
  children, 
  message = "Đăng nhập để sử dụng tính năng này",
  onAuthRequired
}: AuthActionGuardProps) {
  const { user, loading, signInWithGoogle } = useAuth();

  // Nếu đang loading auth, render children bình thường
  if (loading) {
    return <>{children}</>;
  }

  // Nếu đã đăng nhập, render children bình thường (không can thiệp)
  if (user) {
    return <>{children}</>;
  }

  // Guest mode: Intercept onClick để hiện toast với action button
  if (isValidElement(children)) {
    const child = children as ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
    
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (onAuthRequired) {
        onAuthRequired();
      }
      
      // Hiện toast với nút đăng nhập - nhẹ nhàng hơn modal
      toast(message, {
        icon: <LogIn className="w-4 h-4 text-primary" />,
        duration: 8000,
        action: {
          label: "Đăng nhập",
          onClick: () => signInWithGoogle(),
        },
      });
    };

    return cloneElement(child, {
      onClick: handleClick,
    });
  }

  return <>{children}</>;
}
