'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSessionToken } from '../../lib/auth/session';
import { createOrder, updateOrderStatus } from '../../lib/api/orders';
import { ApiError } from '../../lib/api/client';
import type { Order } from '../../lib/types';

function extractMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && typeof err.body === 'object' && err.body !== null && 'message' in err.body) {
    return String((err.body as { message: unknown }).message);
  }
  return fallback;
}

export async function placeOrderAction(
  tableId: string,
  tableSessionId: string,
  _prevState: { error?: string } | undefined,
  formData: FormData,
) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }

  const items: { menuItemId: string; quantity: number }[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('qty_')) {
      const quantity = Number(value);
      if (quantity > 0) {
        items.push({ menuItemId: key.replace('qty_', ''), quantity });
      }
    }
  }

  if (items.length === 0) {
    return { error: 'Select at least one item with a quantity greater than 0' };
  }

  try {
    await createOrder(token, { tableSessionId, items });
  } catch (err) {
    return { error: extractMessage(err, 'Failed to place order') };
  }

  revalidatePath(`/tables/${tableId}`);
  redirect(`/tables/${tableId}`);
}

export async function updateOrderStatusAction(orderId: string, status: Order['status']) {
  const token = await getSessionToken();
  if (!token) {
    redirect('/login');
  }
  await updateOrderStatus(token, orderId, status);
  revalidatePath('/orders');
}
