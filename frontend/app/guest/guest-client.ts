'use client';

export class GuestApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`Guest API error ${status}`);
  }
}

async function guestFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new GuestApiError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export interface PublicTable {
  id: string;
  number: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export function listPublicTables() {
  return guestFetch<PublicTable[]>('/api/public/tables');
}

export interface CheckInPayload {
  guestName?: string;
  guestPhone?: string;
  guestEmail?: string;
}

export interface GuestSession {
  id: string;
  tableId: string;
  status: 'PENDING' | 'ACTIVE' | 'BILLED' | 'CLOSED';
  guestName: string | null;
  guestPhone: string | null;
  guestEmail: string | null;
}

export function requestCheckIn(tableId: string, payload: CheckInPayload) {
  return guestFetch<GuestSession>(`/api/guest/tables/${tableId}/sessions`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
