'use client';

import { useActionState } from 'react';
import { createMenuItemAction } from '../../actions/menu-items';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

export default function NewMenuItemPage() {
  const [state, action, pending] = useActionState(createMenuItemAction, undefined);

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="mb-6 text-2xl font-semibold">Add menu item</h1>
        <form action={action} className="flex flex-col gap-4">
          <Input label="Name" name="name" required />
          <Input label="Description (optional)" name="description" />
          <Input label="Ingredients (optional)" name="ingredients" />
          <Input label="Price" name="price" type="number" step="0.01" min={0} required />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" isLoading={pending}>
            Add item
          </Button>
        </form>
      </div>
    </div>
  );
}
