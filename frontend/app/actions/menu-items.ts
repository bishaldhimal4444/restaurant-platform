'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionToken } from '../../lib/auth/session';
import { createMenuItem, deleteMenuItem, updateMenuItem } from '../../lib/api/menu-items';
import { ApiError } from '../../lib/api/client';

function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === 'object' && err.body !== null && 'message' in err.body) {
    return String((err.body as { message: unknown }).message);
  }
  return fallback;
}

export async function createMenuItemAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const name = formData.get('name')?.toString() ?? '';
  const description = formData.get('description')?.toString() || undefined;
  const ingredients = formData.get('ingredients')?.toString() || undefined;
  const price = Number(formData.get('price'));

  if (name.trim().length < 2) {
    return { error: 'Name must be at least 2 characters' };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { error: 'Price must be a valid non-negative number' };
  }

  try {
    await createMenuItem(token, { name, description, ingredients, price });
  } catch (err) {
    return { error: extractMessage(err, 'Failed to create menu item') };
  }

  revalidatePath('/menu-items');
  redirect('/menu-items');
}

export async function toggleAvailabilityAction(id: string, isAvailable: boolean) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }
  await updateMenuItem(token, id, { isAvailable: !isAvailable });
  revalidatePath('/menu-items');
}

export async function deleteMenuItemAction(id: string) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }
  await deleteMenuItem(token, id);
  revalidatePath('/menu-items');
}
