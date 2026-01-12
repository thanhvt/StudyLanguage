'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { logger } from '@/lib/logger';

function UserActionLoggerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    logger.log('PAGE_VIEW', { url });
  }, [pathname, searchParams]);

  return null;
}

export function UserActionLogger() {
  return (
    <Suspense fallback={null}>
      <UserActionLoggerContent />
    </Suspense>
  );
}
