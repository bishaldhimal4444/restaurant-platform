import { redirect } from 'next/navigation';
import { getSessionToken } from '../../lib/auth/session';
import { getDailyDashboard } from '../../lib/api/dashboard';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatCurrency(n: number) {
  return `Rs. ${n.toFixed(2)}`;
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  PREPARING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  READY: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SERVED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  CANCELLED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
      {sub && <p className="mt-1 text-xs text-zinc-400">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const { date } = await searchParams;
  const selectedDate = date ?? todayISO();
  const data = await getDailyDashboard(token, selectedDate);

  const isToday = selectedDate === todayISO();

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Daily Overview</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {isToday ? "Today" : new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        <form className="flex items-center gap-2 text-sm">
          <input
            type="date"
            name="date"
            defaultValue={selectedDate}
            max={todayISO()}
            className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <button
            type="submit"
            className="rounded-full bg-zinc-900 px-4 py-1.5 text-white hover:bg-zinc-700 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            View
          </button>
          {!isToday && (
            <a href="/dashboard" className="text-zinc-500 hover:underline">
              Today
            </a>
          )}
        </form>
      </div>

      {/* Top-line stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Sales" value={formatCurrency(data.salesTotal)} sub={`${data.billsPaidCount} bill(s) paid`} />
        <StatCard label="Orders" value={data.ordersCount} />
        <StatCard label="New Customers" value={data.newCustomers} />
        <StatCard label="Occupied Tables" value={data.activeTables} sub={data.pendingRequests > 0 ? `${data.pendingRequests} pending request(s)` : undefined} />
      </div>

      {/* Orders by status */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Orders by Status</h2>
        <div className="flex flex-wrap gap-3">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div
              key={status}
              className={`rounded-full px-4 py-2 text-sm font-medium ${ORDER_STATUS_COLORS[status] ?? 'bg-zinc-100 text-zinc-600'}`}
            >
              {status}: {count}
            </div>
          ))}
        </div>
      </div>

      {/* Sales by payment method */}
      {Object.keys(data.salesByMethod).length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-medium">Sales by Payment Method</h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(data.salesByMethod).map(([method, amount]) => (
              <div key={method} className="rounded-lg border border-zinc-200 px-4 py-3 dark:border-zinc-800">
                <p className="text-xs uppercase tracking-wide text-zinc-500">{method}</p>
                <p className="mt-1 font-semibold">{formatCurrency(amount)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top items */}
      <div className="mt-8">
        <h2 className="mb-3 text-lg font-medium">Top Selling Items</h2>
        {data.topItems.length === 0 ? (
          <p className="text-sm text-zinc-500">No orders placed on this day.</p>
        ) : (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800">
            <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {data.topItems.map((item, idx) => (
                <li key={item.menuItemId} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="flex items-center gap-3">
                    <span className="text-zinc-400">#{idx + 1}</span>
                    <span className="font-medium">{item.name}</span>
                  </span>
                  <span className="text-zinc-500">{item.quantity} sold</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
