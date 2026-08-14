import { redirect } from 'next/navigation';
import { getSessionToken } from '../../../lib/auth/session';
import { getTable } from '../../../lib/api/table-sessions';
import { listMenuItems } from '../../../lib/api/menu-items';
import { SeatGuestsForm } from './seat-guests-form';
import { CloseSessionButton } from './close-session-button';
import { ConfirmRejectButtons } from './confirm-reject-buttons';
import { OrderForm } from './order-form';

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const table = await getTable(token, id);
  const activeSession = table.sessions?.[0];

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-1 text-3xl font-semibold">Table {table.number}</h1>
      <p className="mb-8 text-sm text-zinc-500">Seats {table.capacity}</p>

      {activeSession ? (
        <div className="flex flex-col gap-6">
          {activeSession.status === 'PENDING' ? (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-1 text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Table Requested
              </p>
              {activeSession.guestName && <p className="text-lg">{activeSession.guestName}</p>}
              <p className="mt-1 text-sm text-zinc-500">
                Phone: {activeSession.guestPhone || '—'}
              </p>
              {activeSession.guestEmail && (
                <p className="mt-1 text-sm text-zinc-500">
                  Email: {activeSession.guestEmail}
                </p>
              )}
              <p className="mt-1 text-sm text-zinc-500">
                Requested at {new Date(activeSession.startedAt).toLocaleTimeString()}
              </p>
              <div className="mt-4">
                <ConfirmRejectButtons tableId={table.id} sessionId={activeSession.id} />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-950">
              <p className="mb-1 text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-400">
                Occupied
              </p>
              {activeSession.guestName && <p className="text-lg">{activeSession.guestName}</p>}
              <p className="mt-1 text-sm text-zinc-500">
                Seated at {new Date(activeSession.startedAt).toLocaleTimeString()}
              </p>
              <div className="mt-4">
                <CloseSessionButton tableId={table.id} sessionId={activeSession.id} />
              </div>
            </div>
          )}

          {activeSession.orders && activeSession.orders.length > 0 && activeSession.status === 'ACTIVE' && (
            <div>
              <h2 className="mb-3 text-lg font-medium">Orders</h2>
              <div className="flex flex-col gap-3">
                {activeSession.orders.map((order) => (
                  <div key={order.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                        {order.status}
                      </span>
                    </div>
                    <ul className="text-sm">
                      {order.items.map((item) => (
                        <li key={item.id}>
                          {item.quantity}× {item.menuItem?.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSession.status === 'ACTIVE' && (
            <MenuOrderSection tableId={table.id} tableSessionId={activeSession.id} />
          )}
        </div>
      ) : (
        <SeatGuestsForm tableId={table.id} />
      )}
    </div>
  );
}

async function MenuOrderSection({
  tableId,
  tableSessionId,
}: {
  tableId: string;
  tableSessionId: string;
}) {
  const items = await listMenuItems();
  const available = items.filter((item) => item.isAvailable);

  return (
    <div>
      <h2 className="mb-3 text-lg font-medium">Place order</h2>
      {available.length === 0 ? (
        <p className="text-sm text-zinc-500">No available menu items.</p>
      ) : (
        <OrderForm tableId={tableId} tableSessionId={tableSessionId} items={available} />
      )}
    </div>
  );
}
