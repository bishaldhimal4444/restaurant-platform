'use client';

import { useTransition } from 'react';
import type { MenuItem } from '../../lib/types';
import { toggleAvailabilityAction, deleteMenuItemAction } from '../actions/menu-items';
import { Button } from '../../components/ui/button';

export function MenuItemRow({ item }: { item: MenuItem }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-between py-4">
      <div>
        <p className="font-medium">{item.name}</p>
        {item.description && <p className="text-sm text-zinc-500">{item.description}</p>}
        {item.ingredients && (
          <p className="mt-0.5 text-xs text-zinc-400">Ingredients: {item.ingredients}</p>
        )}
        <p className="mt-1 text-sm">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium uppercase tracking-wide ${
            item.isAvailable ? 'text-emerald-600' : 'text-zinc-400'
          }`}
        >
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </span>
        <Button
          type="button"
          variant="secondary"
          isLoading={isPending}
          onClick={() => startTransition(() => toggleAvailabilityAction(item.id, item.isAvailable))}
        >
          {item.isAvailable ? 'Mark unavailable' : 'Mark available'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          isLoading={isPending}
          onClick={() => startTransition(() => deleteMenuItemAction(item.id))}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
