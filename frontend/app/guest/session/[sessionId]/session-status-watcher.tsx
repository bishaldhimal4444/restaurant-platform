'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getGuestSession } from '../../guest-client';
import { useCart } from '../../hooks/use-cart';

const POLL_INTERVAL_MS = 4000;

export function SessionStatusWatcher({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const { clearCart } = useCart();
  const redirectedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(async () => {
      if (redirectedRef.current || cancelled) return;
      try {
        const session = await getGuestSession(sessionId);
        if (session.status === 'CLOSED' || session.status === 'BILLED') {
          redirectedRef.current = true;
          clearInterval(interval);
          clearCart();
          router.push('/guest?session=ended');
        }
      } catch {
        // Ignore transient polling errors (e.g. brief network blip)
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [sessionId, router, clearCart]);

  return null;
}
