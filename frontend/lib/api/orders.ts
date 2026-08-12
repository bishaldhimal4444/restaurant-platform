import { apiFetch } from './client';
import type { Order } from '../types';

export function createOrder(
  token: string,
  data: { tableSessionId: string; items: { menuItemId: string; quantity: number }[] },
) {
  return apiFetch<Order>('/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function listActiveOrders(token: string) {
  return apiFetch<Order[]>('/orders/active', { token });
}

export function updateOrderStatus(token: string, id: string, status: Order['status']) {
  return apiFetch<Order>(`/orders/${id}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}
