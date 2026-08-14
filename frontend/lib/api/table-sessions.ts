import { apiFetch } from './client';
import type { Table, TableSession } from '../types';

export function getTable(token: string, id: string) {
  return apiFetch<Table & { sessions: TableSession[] }>(`/tables/${id}`, { token });
}

export function openSession(
  token: string,
  tableId: string,
  data: { guestName?: string; guestPhone?: string; guestEmail?: string },
) {
  return apiFetch<TableSession>(`/tables/${tableId}/sessions`, {
    method: 'POST',
    token,
    body: JSON.stringify(data),
  });
}

export function getSession(token: string, id: string) {
  return apiFetch<TableSession>(`/table-sessions/${id}`, { token });
}

export function closeSession(token: string, id: string) {
  return apiFetch<TableSession>(`/table-sessions/${id}/close`, {
    method: 'POST',
    token,
  });
}

export function getPendingSessions(token: string) {
  return apiFetch<(TableSession & { table: Table })[]>(`/table-sessions/pending`, { token });
}

export function confirmSession(token: string, id: string) {
  return apiFetch<TableSession>(`/table-sessions/${id}/confirm`, {
    method: 'POST',
    token,
  });
}

export function rejectSession(token: string, id: string) {
  return apiFetch<TableSession>(`/table-sessions/${id}/reject`, {
    method: 'POST',
    token,
  });
}