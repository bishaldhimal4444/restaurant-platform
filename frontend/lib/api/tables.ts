import { apiFetch } from './client';
import type { Table } from '../types';

export function listTables(token: string) {
  return apiFetch<Table[]>('/tables', { token });
}

export function getTable(token: string, id: string) {
  return apiFetch<Table>(`/tables/${id}`, { token });
}

export function createTable(
  token: string,
  data: { number: number; capacity: number },
) {
  return apiFetch<Table>('/tables', {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}
