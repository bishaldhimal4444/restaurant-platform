import { redirect } from 'next/navigation';
import { GREEN, PAPER, PAPER_DIM, PINK } from '../../theme';

interface PageProps {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function GuestSessionPage({ params, searchParams }: PageProps) {
  const { sessionId } = await params;
  const { order } = await searchParams;

  // For now, redirect to menu
  // Later we'll add session details, order history, and bill generation
  if (order === 'success') {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div
            className="mb-6 mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: 'rgba(46,204,113,0.15)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={GREEN} className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl" style={{ color: PAPER, fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontWeight: 600 }}>
            Order Placed!
          </h1>
          <p className="mt-3 text-[15px]" style={{ color: PAPER_DIM }}>
            Your order has been sent to the kitchen. You can continue browsing the menu or wait for your food.
          </p>
          <div className="mt-8 flex gap-3 justify-center">
            <a
              href={`/guest/session/${sessionId}/menu`}
              className="rounded-full px-6 py-2.5 text-sm font-semibold"
              style={{ background: PINK, color: '#1B1330' }}
            >
              Continue Ordering
            </a>
          </div>
        </div>
      </div>
    );
  }

  redirect(`/guest/session/${sessionId}/menu`);
}
