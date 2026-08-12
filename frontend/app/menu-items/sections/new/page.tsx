'use client';

import { useActionState } from 'react';
import { createSectionAction } from '../../../actions/menu-items';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function NewSectionPage() {
  const [state, action, pending] = useActionState(createSectionAction, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Add menu section</h1>
        <form action={action} className="flex flex-col gap-4">
          <Input label="Name" name="name" required placeholder="e.g., Breakfast, Main Course, Drinks" />
          <Input label="Description (optional)" name="description" />
          <Input label="Display Order" name="displayOrder" type="number" min={0} value="0" />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" isLoading={pending}>
            Add section
          </Button>
        </form>
      </div>
    </div>
  );
}
