import { GuestSessionForm } from './guest-session-form';

interface PageProps {
  params: Promise<{ tableId: string }>;
  searchParams: Promise<{ ts?: string; sig?: string }>;
}

export default async function GuestSessionStartPage({ params, searchParams }: PageProps) {
  const { tableId } = await params;
  const { ts, sig } = await searchParams;

  if (!ts || !sig) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">Invalid QR Code</h1>
          <p className="mt-2 text-zinc-500">Missing signature parameters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-800">
          <h1 className="mb-6 text-2xl font-semibold text-center">Welcome!</h1>
          <p className="mb-6 text-center text-zinc-500">
            Enter your details to start your order
          </p>

          <GuestSessionForm tableId={tableId} ts={ts} sig={sig} />
        </div>
      </div>
    </div>
  );
}
