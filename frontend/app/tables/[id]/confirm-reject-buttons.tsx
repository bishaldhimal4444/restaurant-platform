'use client';

import { useTransition } from 'react';
import { confirmSessionAction, rejectSessionAction } from '../../actions/table-sessions';
import { Button } from '../../../components/ui/button';

export function ConfirmRejectButtons({ tableId, sessionId }: { tableId: string; sessionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      <Button
        type="button"
        isLoading={isPending}
        onClick={() => startTransition(() => confirmSessionAction(tableId, sessionId))}
      >
        Confirm
      </Button>
      <Button
        type="button"
        variant="secondary"
        isLoading={isPending}
        onClick={() => {
          if (confirm('Reject this request? The table will become available.')) {
            startTransition(() => rejectSessionAction(tableId, sessionId));
          }
        }}
      >
        Reject
      </Button>
    </div>
  );
}
