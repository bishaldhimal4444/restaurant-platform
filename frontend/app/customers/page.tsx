import { redirect } from 'next/navigation';
import { getSessionToken } from '../../lib/auth/session';
import { listAllSessions } from '../../lib/api/table-sessions';
import { listCustomers } from '../../lib/api/customers';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function getMonthKey(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

function formatCurrency(n: number) {
  return `Rs. ${n.toFixed(2)}`;
}

function tabLinkClass(isActive: boolean) {
  const base = 'rounded-full px-4 py-1.5 text-sm font-medium';
  const active = 'bg-zinc-900 text-white dark:bg-white dark:text-black';
  const inactive = 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white';
  return base + ' ' + (isActive ? active : inactive);
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'text-amber-600',
  ACTIVE: 'text-emerald-600',
  BILLED: 'text-blue-600',
  CLOSED: 'text-zinc-400',
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; tab?: string; search?: string }>;
}) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const { month, tab, search } = await searchParams;
  const activeTab = tab === 'log' ? 'log' : 'profiles';

  const [allSessions, customers] = await Promise.all([
    listAllSessions(token),
    listCustomers(token, search),
  ]);

  const availableMonths = Array.from(
    new Set(allSessions.map((s) => getMonthKey(s.startedAt))),
  ).sort((a, b) => (a < b ? 1 : -1));

  const sessions = month
    ? allSessions.filter((s) => getMonthKey(s.startedAt) === month)
    : allSessions;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Customers</h1>
        <div className="flex gap-1 rounded-full border border-zinc-200 p-1 dark:border-zinc-800">
          <a href="/customers?tab=profiles" className={tabLinkClass(activeTab === 'profiles')}>
            Profiles
          </a>
          <a href="/customers?tab=log" className={tabLinkClass(activeTab === 'log')}>
            Check-in Log
          </a>
        </div>
      </div>

      {activeTab === 'profiles' ? (
        <>
          <form className="mb-6 flex items-center gap-2 text-sm">
            <input type="hidden" name="tab" value="profiles" />
            <input
              type="text"
              name="search"
              defaultValue={search ?? ''}
              placeholder="Search by name, phone, or email"
              className="w-full max-w-sm rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Search
            </button>
          </form>

          {customers.length === 0 ? (
            <p className="text-zinc-500">
              {search ? 'No customers match that search.' : 'No returning customers yet — profiles are created once staff confirm a check-in with a phone number.'}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Visits</th>
                    <th className="px-4 py-3">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="px-4 py-3 font-medium">
                        <a href={`/customers/${customer.id}`} className="hover:underline">
                          {customer.name || '—'}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{customer.phone}</td>
                      <td className="px-4 py-3 text-zinc-500">{customer.email || '—'}</td>
                      <td className="px-4 py-3">{customer.visitCount}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(customer.totalSpent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <>
          <form className="mb-6 flex items-center gap-2 text-sm">
            <input type="hidden" name="tab" value="log" />
            <label htmlFor="month" className="text-zinc-500">
              Filter by month
            </label>
            <select
              id="month"
              name="month"
              defaultValue={month ?? ''}
              className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            >
              <option value="">All months</option>
              {availableMonths.map((key) => (
                <option key={key} value={key}>
                  {getMonthLabel(key)}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Apply
            </button>
          </form>

          {sessions.length === 0 ? (
            <p className="text-zinc-500">
              {month ? 'No customer check-ins for this month.' : 'No customer check-ins yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-wide text-zinc-500 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Table</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Checked In</th>
                    <th className="px-4 py-3">Checked Out</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td className="px-4 py-3 font-medium">{session.guestName || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{session.guestPhone || '—'}</td>
                      <td className="px-4 py-3 text-zinc-500">{session.guestEmail || '—'}</td>
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
        </>
      )}
    </div>
  );
}
