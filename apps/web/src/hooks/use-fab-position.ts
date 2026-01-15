/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * useFabPosition - Hook quản lý vị trí FAB
 * 
 * Mục đích: Lưu/đọc vị trí FAB từ localStorage, constrain trong viewport
 * Tham số đầu vào: Không
 * Tham số đầu ra: { position, setPosition, resetPosition, isLoaded }
 * Khi nào sử dụng: Trong MobileFAB component để lưu vị trí người dùng đã kéo
 */

const STORAGE_KEY = 'fab-position';
const FAB_SIZE = 56;
const PADDING = 16;

// Vị trí mặc định: undefined = dùng CSS right/bottom
export interface FabPosition {
  x: number; // Tọa độ x từ trái viewport
  y: number; // Tọa độ y từ trên viewport
}

export function useFabPosition() {
  // null = chưa load, undefined = dùng vị trí mặc định CSS
  const [position, setPositionState] = useState<FabPosition | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Tính vị trí mặc định khi chưa có saved position
  const getDefaultPosition = useCallback((): FabPosition => {
    if (typeof window === 'undefined') {
      return { x: 300, y: 600 };
    }
    return {
      x: window.innerWidth - FAB_SIZE - PADDING,
      y: window.innerHeight - FAB_SIZE - PADDING - 60, // 60px cho safe area
    };
  }, []);

  // Đọc vị trí từ localStorage khi mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          // Constrain trong viewport hiện tại
          const maxX = window.innerWidth - FAB_SIZE - PADDING;
          const maxY = window.innerHeight - FAB_SIZE - PADDING - 60;
          setPositionState({
            x: Math.max(PADDING, Math.min(maxX, parsed.x)),
            y: Math.max(PADDING, Math.min(maxY, parsed.y)),
          });
        } else {
          setPositionState(getDefaultPosition());
        }
      } else {
        setPositionState(getDefaultPosition());
      }
    } catch (error) {
      console.warn('Không thể đọc vị trí FAB từ localStorage:', error);
      setPositionState(getDefaultPosition());
    }
    setIsLoaded(true);
  }, [getDefaultPosition]);

  /**
   * Cập nhật vị trí FAB và lưu vào localStorage
   */
  const setPosition = useCallback((newPosition: FabPosition) => {
    // Constrain trong viewport
    const maxX = typeof window !== 'undefined' 
      ? window.innerWidth - FAB_SIZE - PADDING 
      : 1000;
    const maxY = typeof window !== 'undefined' 
      ? window.innerHeight - FAB_SIZE - PADDING - 60
      : 800;

    const constrainedPosition = {
      x: Math.max(PADDING, Math.min(maxX, newPosition.x)),
      y: Math.max(PADDING, Math.min(maxY, newPosition.y)),
    };

    setPositionState(constrainedPosition);
    
    // Lưu vào localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(constrainedPosition));
    } catch (error) {
      console.warn('Không thể lưu vị trí FAB vào localStorage:', error);
    }
  }, []);

  /**
   * Reset về vị trí mặc định
   */
  const resetPosition = useCallback(() => {
    const defaultPos = getDefaultPosition();
    setPositionState(defaultPos);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Không thể xóa vị trí FAB từ localStorage:', error);
    }
  }, [getDefaultPosition]);

  // Listen for window resize to constrain position
  useEffect(() => {
    const handleResize = () => {
      if (position) {
        // Re-constrain current position
        setPosition(position);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, setPosition]);

  return {
    position: position || getDefaultPosition(),
    setPosition,
    resetPosition,
    isLoaded,
  };
}
