'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionToken } from '../../lib/auth/session';
import { openSession, closeSession } from '../../lib/api/table-sessions';
import { ApiError } from '../../lib/api/client';

function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === 'object' && err.body !== null && 'message' in err.body) {
    return String((err.body as { message: unknown }).message);
  }
  return fallback;
}

export async function openSessionAction(
  tableId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const guestName = formData.get('guestName')?.toString() || undefined;
  const guestPhone = formData.get('guestPhone')?.toString() || undefined;
  const guestEmail = formData.get('guestEmail')?.toString() || undefined;

  try {
    await openSession(token, tableId, { guestName, guestPhone, guestEmail });
  } catch (err) {
    return { error: extractMessage(err, 'Failed to seat guests') };
  }

  revalidatePath(`/tables/${tableId}`);
  redirect(`/tables/${tableId}`);
}

export async function closeSessionAction(tableId: string, sessionId: string) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  await closeSession(token, sessionId);
  revalidatePath(`/tables/${tableId}`);
  redirect('/');
}
