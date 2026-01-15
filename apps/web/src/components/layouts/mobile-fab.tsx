'use client';

import { useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Home, Headphones, Mic, BookOpen, Menu, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFabPosition } from '@/hooks/use-fab-position';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { RightPanelContent } from './right-panel';

/**
 * MobileFAB - Floating Action Button Navigation cho Mobile
 * 
 * Mục đích: Thay thế tab bar truyền thống bằng FAB draggable với popup menu
 * Tham số đầu vào: Không
 * Tham số đầu ra: JSX.Element
 * Khi nào sử dụng: Hiển thị cố định trên mobile (< 1024px), có thể kéo thả
 * 
 * Features:
 * - Draggable với vị trí được lưu vào localStorage
 * - Circular menu với staggered animation
 * - Pulse effect khi item được chọn
 * - Touch-friendly (56x56px)
 */

// Cấu hình menu items
const menuItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
    color: 'hsl(152, 76%, 40%)',
    angle: -135, // Vị trí theo góc (độ)
  },
  {
    id: 'listening',
    label: 'Nghe',
    icon: Headphones,
    href: '/listening',
    color: 'hsl(200, 90%, 50%)',
    angle: -90,
  },
  {
    id: 'speaking',
    label: 'Nói',
    icon: Mic,
    href: '/speaking',
    color: 'hsl(152, 76%, 40%)',
    angle: -45,
  },
  {
    id: 'reading',
    label: 'Đọc',
    icon: BookOpen,
    href: '/reading',
    color: 'hsl(280, 70%, 55%)',
    angle: 0,
  },
];

// Khoảng cách từ FAB tới menu items
const MENU_RADIUS = 80;
const FAB_SIZE = 56;

export function MobileFAB() {
  const pathname = usePathname();
  const router = useRouter();
  const { position, setPosition, isLoaded } = useFabPosition();
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const fabRef = useRef<HTMLDivElement>(null);

  const [dragKey, setDragKey] = useState(0);

  // Xác định active route
  const activeRoute = (() => {
    if (pathname === '/') return 'home';
    if (pathname.startsWith('/listening')) return 'listening';
    if (pathname.startsWith('/speaking')) return 'speaking';
    if (pathname.startsWith('/reading')) return 'reading';
    return 'home';
  })();

  // Tính vị trí menu items theo kiểu arc (cung tròn)
  const getItemPosition = (angle: number) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radian) * MENU_RADIUS,
      y: Math.sin(radian) * MENU_RADIUS,
    };
  };

  // Xử lý khi chọn menu item
  const handleItemClick = (item: typeof menuItems[0]) => {
    setSelectedItem(item.id);
    
    // Haptic feedback nếu có
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    // Delay để show animation trước khi navigate
    setTimeout(() => {
      setIsOpen(false);
      setSelectedItem(null);
      if (item.href !== pathname) {
        router.push(item.href);
      }
    }, 300);
  };

  // Xử lý drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    
    // Lấy vị trí thực tế sau khi drag từ DOM rect
    // Dùng cách này chính xác hơn cộng offset và tránh bug transform cộng dồn
    if (fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      setPosition({ x: rect.left, y: rect.top });
      
      // Force re-mount component để reset transform của framer-motion
      // Tránh việc vị trí bị cộng dồn (left/top mới + transform cũ)
      setDragKey(prev => prev + 1);
    }
  };

  // Không render cho tới khi load xong position
  if (!isLoaded) return null;

  return (
    <>
      {/* Constraints container - fullscreen */}
      <div 
        ref={constraintsRef}
        className="lg:hidden fixed inset-0 pointer-events-none z-40"
      />

      {/* FAB Container - dùng left/top thay vì right/bottom */}
      <motion.div
        key={dragKey} // Reset transform khi drag xong
        ref={fabRef}
        className="lg:hidden fixed z-50 touch-none tap-highlight-transparent select-none"
        style={{
          left: position.x,
          top: position.y,
          WebkitTapHighlightColor: 'transparent',
          background: 'transparent', // Đảm bảo không có nền
          outline: 'none', // Loại bỏ focus outline
          // @ts-expect-error - webkit vendor prefix
          WebkitUserDrag: 'none', // Loại bỏ browser drag ghost image
        }}
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        whileDrag={{ scale: 1.1 }}
      >
        {/* Menu Items - hiển thị khi mở */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                }}
              />

              {/* Menu Items */}
              {menuItems.map((item, index) => {
                const pos = getItemPosition(item.angle);
                const IconComponent = item.icon;
                const isActive = activeRoute === item.id;
                const isSelected = selectedItem === item.id;

                return (
                  <motion.button
                    key={item.id}
                    className={cn(
                      'absolute flex items-center justify-center rounded-full',
                      'w-12 h-12 shadow-lg border-2 tap-highlight-transparent',
                      'transition-colors duration-200 focus:outline-none focus:ring-0',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground',
                    )}
                    style={{
                      borderColor: item.color,
                      left: FAB_SIZE / 2 - 24, // Center relative to FAB
                      top: FAB_SIZE / 2 - 24,
                      boxShadow: isSelected 
                        ? `0 0 20px ${item.color}, 0 0 40px ${item.color}50`
                        : `0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                    initial={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{ 
                      x: pos.x, 
                      y: pos.y, 
                      scale: isSelected ? 1.3 : 1,
                      opacity: 1,
                    }}
                    exit={{ 
                      x: 0, 
                      y: 0, 
                      scale: 0,
                      opacity: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      delay: index * 0.05,
                    }}
                    onClick={() => handleItemClick(item)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {/* Pulse ring animation khi selected */}
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        style={{ borderColor: item.color, borderWidth: 2 }}
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      />
                    )}
                    
                    <IconComponent 
                      className="w-5 h-5" 
                      style={{ color: isActive ? undefined : item.color }}
                    />


                  </motion.button>
                );
              })}

              {/* Menu Button - đặc biệt */}
              <motion.button
                className={cn(
                  'absolute flex items-center justify-center rounded-full',
                  'w-12 h-12 shadow-lg border-2 bg-card text-foreground tap-highlight-transparent',
                  'focus:outline-none focus:ring-0'
                )}
                style={{
                  borderColor: 'hsl(30, 90%, 50%)',
                  left: FAB_SIZE / 2 - 24,
                  top: FAB_SIZE / 2 - 24,
                }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                animate={{ 
                  x: Math.cos((45 * Math.PI) / 180) * MENU_RADIUS, 
                  y: Math.sin((45 * Math.PI) / 180) * MENU_RADIUS, 
                  scale: 1,
                  opacity: 1,
                }}
                exit={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 20,
                  delay: menuItems.length * 0.05,
                }}
                onClick={() => {
                  setIsOpen(false);
                  setIsMenuOpen(true);
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu className="w-5 h-5" style={{ color: 'hsl(30, 90%, 50%)' }} />
                

              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.button
          className={cn(
            'relative flex items-center justify-center rounded-full',
            'shadow-xl border-2 border-primary/30 tap-highlight-transparent',
            'bg-primary text-primary-foreground focus:outline-none focus:ring-0',
            isDragging ? 'cursor-grabbing' : 'cursor-grab',
          )}
          style={{
            width: FAB_SIZE,
            height: FAB_SIZE,
            boxShadow: isOpen 
              ? '0 8px 32px rgba(var(--primary), 0.4), 0 0 20px rgba(var(--primary), 0.2)'
              : '0 8px 24px rgba(0,0,0,0.2)',
            WebkitTapHighlightColor: 'transparent',
            background: undefined, // Đảm bảo dùng class bg-primary
          }}
          draggable={false}
          onClick={() => !isDragging && setIsOpen(!isOpen)}
          animate={{ 
            rotate: isOpen ? 45 : 0,
            scale: isDragging ? 1.1 : 1,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          {/* Icon chính */}
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-0.5"
              >
                {/* Custom hamburger-like icon với dots */}
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-current rounded-full" />
                  <span className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-current rounded-full" />
                  <span className="w-1.5 h-1.5 bg-current rounded-full" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pulse ring liên tục nhẹ */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.button>
      </motion.div>

      {/* Menu / Settings Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right" className="p-0 border-l border-border/40 w-[320px] sm:w-[380px]">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          {/* Close Button */}
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="absolute right-4 top-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted backdrop-blur-sm border border-border/50 transition-colors"
          >
            <span className="sr-only">Close</span>
            <X className="w-4 h-4" />
          </button>
          {/* Content */}
          <div className="h-full overflow-y-auto px-5 pb-24 pt-14 space-y-5">
            <RightPanelContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
