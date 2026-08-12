'use client';

import { closeSessionAction } from '../../actions/table-sessions';
import { Button } from '../../../components/ui/button';

export function CloseSessionButton({ tableId, sessionId }: { tableId: string; sessionId: string }) {
  const action = closeSessionAction.bind(null, tableId, sessionId);

  return (
    <form action={action}>
      <Button type="submit" variant="secondary">
        Close session
      </Button>
    </form>
  );
}
