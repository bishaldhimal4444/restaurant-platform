import { redirect } from 'next/navigation';
import { getSessionToken } from '../../../lib/auth/session';
import { getCustomer } from '../../../lib/api/customers';
import { NotesForm } from './notes-form';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function formatCurrency(n: number) {
  return `Rs. ${n.toFixed(2)}`;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-amber-600',
  ACTIVE: 'text-emerald-600',
  BILLED: 'text-blue-600',
  CLOSED: 'text-zinc-400',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: PageProps) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const { id } = await params;
  const customer = await getCustomer(token, id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <a href="/customers" className="text-sm text-zinc-500 hover:underline">
        ← Back to customers
      </a>

      <div className="mt-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name || 'Unnamed customer'}</h1>
          <p className="mt-1 text-zinc-500">{customer.phone}</p>
          {customer.email && <p className="text-zinc-500">{customer.email}</p>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Total Visits</p>
          <p className="mt-1 text-2xl font-semibold">{customer.visitCount}</p>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Total Spent</p>
          <p className="mt-1 text-2xl font-semibold">{formatCurrency(customer.totalSpent)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Notes</h2>
        <NotesForm customerId={customer.id} initialNotes={customer.notes ?? ''} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Visit History</h2>
        {!customer.sessions || customer.sessions.length === 0 ? (
          <p className="text-sm text-zinc-500">No visits recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-3">Table</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Checked In</th>
                  <th className="px-4 py-3">Checked Out</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {customer.sessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-4 py-3">
                      {session.table ? `Table ${session.table.number}` : '—'}
                    </td>
                    <td className={`px-4 py-3 font-medium ${STATUS_STYLES[session.status] ?? ''}`}>
                      {session.status}
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{formatDateTime(session.startedAt)}</td>
                    <td className="px-4 py-3 text-zinc-500">
                      {session.endedAt ? formatDateTime(session.endedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
