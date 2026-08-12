'use client';

import { useActionState } from 'react';
import { placeOrderAction } from '../../actions/orders';
import { Button } from '../../../components/ui/button';
import type { MenuItem } from '../../../lib/types';

export function OrderForm({
  tableId,
  tableSessionId,
  items,
}: {
  tableId: string;
  tableSessionId: string;
  items: MenuItem[];
}) {
  const action = placeOrderAction.bind(null, tableId, tableSessionId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <div className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-zinc-500">${item.price.toFixed(2)}</p>
            </div>
            <input
              type="number"
              name={`qty_${item.id}`}
              min={0}
              defaultValue={0}
              className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        ))}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" isLoading={pending}>
        Place order
      </Button>
    </form>
  );
}
