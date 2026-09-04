import { apiFetch } from './client';
import type { Customer } from '../types';

export function listCustomers(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Customer[]>(`/customers${query}`, { token });
}

export function getCustomer(token: string, id: string) {
  return apiFetch<Customer>(`/customers/${id}`, { token });
}

export function updateCustomerNotes(token: string, id: string, notes: string) {
  return apiFetch<Customer>(`/customers/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ notes }),
  });
}
