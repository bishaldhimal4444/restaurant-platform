import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ tableId: string }>;
  searchParams: Promise<{ ts?: string; sig?: string }>;
}

export default async function GuestTablePage({ params, searchParams }: PageProps) {
  const { tableId } = await params;
  const { ts, sig } = await searchParams;

  // QR must have valid signature
  if (!ts || !sig) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">Invalid QR Code</h1>
          <p className="mt-2 text-zinc-500">
            This QR code is missing required parameters. Please scan the QR code on your table.
          </p>
        </div>
      </div>
    );
  }

  // Redirect to session check/create page with the QR params
  redirect(`/guest/tables/${tableId}/session?ts=${ts}&sig=${sig}`);
}
