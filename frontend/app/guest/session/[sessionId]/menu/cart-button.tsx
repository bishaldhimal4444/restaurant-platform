'use client';

import Link from 'next/link';
import { useCart } from '../../../hooks/use-cart';
import { PINK } from '../../../theme';

interface CartButtonProps {
  sessionId: string;
}

export function CartButton({ sessionId }: CartButtonProps) {
  const { itemCount, total, isHydrated } = useCart();

  if (!isHydrated || itemCount === 0) {
    return null;
  }

  return (
    <Link
      href={`/guest/session/${sessionId}/cart`}
      className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-lg transition hover:-translate-y-0.5"
      style={{ background: PINK, color: '#1B1330' }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
        />
      </svg>
      <span>{itemCount} items</span>
      <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: 'rgba(27,19,48,0.2)' }}>
        Rs. {total.toFixed(2)}
      </span>
    </Link>
  );
}
