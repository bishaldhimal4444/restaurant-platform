'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionToken } from '../../lib/auth/session';
import { createTable } from '../../lib/api/tables';
import { ApiError } from '../../lib/api/client';

export async function createTableAction(
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const number = Number(formData.get('number'));
  const capacity = Number(formData.get('capacity'));

  if (!Number.isInteger(number) || number < 1) {
    return { error: 'Table number must be a positive whole number' };
  }
  if (!Number.isInteger(capacity) || capacity < 1) {
    return { error: 'Capacity must be a positive whole number' };
  }

  try {
    await createTable(token, { number, capacity });
  } catch (err) {
    if (err instanceof ApiError) {
      const message =
        typeof err.body === 'object' && err.body !== null && 'message' in err.body
          ? String((err.body as { message: unknown }).message)
          : 'Failed to create table';
      return { error: message };
    }
    return { error: 'Failed to create table' };
  }

  revalidatePath('/');
  redirect('/');
}
