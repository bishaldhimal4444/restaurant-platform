'use client';

import { useActionState } from 'react';
import { createTableAction } from '../../actions/tables';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function NewTablePage() {
  const [state, action, pending] = useActionState(createTableAction, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Add table</h1>
        <form action={action} className="flex flex-col gap-4">
          <Input label="Table number" name="number" type="number" min={1} required />
          <Input label="Capacity" name="capacity" type="number" min={1} required />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" isLoading={pending}>
            Add table
          </Button>
        </form>
      </div>
    </div>
  );
}
