'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../../../hooks/use-cart';
import { GOLD, PAPER, PAPER_DIM, PINK, RED } from '../../../theme';

interface CartPageProps {
  params: Promise<{ sessionId: string }>;
}

export default function CartPage({ params }: CartPageProps) {
  const router = useRouter();
  const { items, total, isHydrated, updateQuantity, removeItem, clearCart } = useCart();
  const [sessionId, setSessionId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setSessionId(p.sessionId));
  }, [params]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/guest/table-sessions/${sessionId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to place order');
      }

      clearCart();
      router.push(`/guest/session/${sessionId}?order=success`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div style={{ color: PAPER_DIM }}>Loading cart…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-md"
        style={{ background: 'rgba(11,6,32,0.75)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <a
            href={`/guest/session/${sessionId}/menu`}
            className="mr-4 flex h-9 w-9 items-center justify-center rounded-full transition"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={PAPER} className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </a>
          <h1 className="text-3xl leading-none" style={{ color: PAPER, fontFamily: 'var(--font-display)' }}>
            Your Cart
          </h1>
        </div>
      </header>

      {/* Cart Content */}
      <main className="mx-auto max-w-3xl px-6 py-8">
        {items.length === 0 ? (
          <div
            className="rounded-2xl p-10 text-center backdrop-blur-md"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="rgba(255,255,255,0.35)" className="mx-auto h-12 w-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            <h2 className="mt-4 text-lg" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontWeight: 600 }}>
              Your cart is empty
            </h2>
            <p className="mt-2 text-sm" style={{ color: PAPER_DIM }}>
              Add some items from the menu to get started.
            </p>
            <a
              href={`/guest/session/${sessionId}/menu`}
              className="mt-6 inline-block rounded-full px-6 py-2.5 text-sm font-semibold"
              style={{ background: PINK, color: '#1B1330' }}
            >
              Browse Menu
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cart Items */}
            <div
              className="overflow-hidden rounded-2xl backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <ul className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                {items.map((item) => (
                  <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <div className="flex-1 min-w-[140px]">
                      <h3 className="font-medium" style={{ color: PAPER }}>
                        {item.name}
                      </h3>
                      <p className="text-sm" style={{ color: PAPER_DIM }}>
                        Rs. {item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition"
                        style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={PAPER} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-medium" style={{ color: PAPER }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full transition"
                        style={{ border: '1px solid rgba(255,255,255,0.2)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={PAPER} className="h-4 w-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>

                      <span className="ml-2 w-20 text-right font-semibold" style={{ color: GOLD }}>
                        Rs. {(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-1 transition"
                        style={{ color: 'rgba(255,255,255,0.4)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="rounded-xl p-4 text-sm"
                style={{ background: 'rgba(255,77,77,0.12)', border: '1px solid rgba(255,77,77,0.3)', color: RED }}
              >
                {error}
              </div>
            )}

            {/* Order Summary */}
            <div
              className="rounded-2xl p-5 backdrop-blur-md"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}
            >
              <div className="flex items-center justify-between text-lg font-semibold" style={{ color: PAPER }}>
                <span>Total</span>
                <span style={{ color: GOLD }}>Rs. {total.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-sm" style={{ color: PAPER_DIM }}>
                Place order now. You can add more items later.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => clearCart()}
                className="flex-1 rounded-xl py-3 font-medium transition"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: PAPER }}
              >
                Clear Cart
              </button>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="flex-1 rounded-xl py-3 font-semibold transition disabled:opacity-50"
                style={{ background: PINK, color: '#1B1330' }}
              >
                {submitting ? 'Placing Order…' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
