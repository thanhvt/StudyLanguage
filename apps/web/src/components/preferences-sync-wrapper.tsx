'use client';

import { usePreferencesSync } from '@/hooks/use-preferences-sync';
import { ReactNode } from 'react';

/**
 * PreferencesSyncWrapper Component
 *
 * Mục đích: Client component để kích hoạt usePreferencesSync
 * Khi nào sử dụng: Thêm vào layout để sync user preferences với DB
 */
export function PreferencesSyncWrapper({ children }: { children: ReactNode }) {
  usePreferencesSync();
  return <>{children}</>;
}
