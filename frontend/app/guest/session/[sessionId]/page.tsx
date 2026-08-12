import { redirect } from 'next/navigation';

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
          <div className="mb-6 rounded-full bg-green-100 p-4 mx-auto w-fit dark:bg-green-900/30">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-12 w-12 text-green-600 dark:text-green-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold">Order Placed!</h1>
          <p className="mt-2 text-zinc-500">
            Your order has been sent to the kitchen. You can continue browsing the menu or wait for your food.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <a
              href={`/guest/session/${sessionId}/menu`}
              className="rounded-full bg-zinc-900 px-6 py-2 font-medium text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
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
