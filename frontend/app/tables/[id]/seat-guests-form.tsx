'use client';

import { useActionState } from 'react';
import { openSessionAction } from '../../actions/table-sessions';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export function SeatGuestsForm({ tableId }: { tableId: string }) {
  const action = openSessionAction.bind(null, tableId);
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-6 dark:border-zinc-800">
      <p className="text-sm text-zinc-500">This table is available. Seat a party to start a session.</p>
      <Input label="Guest name (optional)" name="guestName" />
      <Input label="Guest phone (optional)" name="guestPhone" />
      <Input label="Guest email (optional)" name="guestEmail" type="email" />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" isLoading={pending}>
        Seat guests
      </Button>
    </form>
  );
}
