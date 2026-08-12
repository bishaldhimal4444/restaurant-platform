import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://backend:4000';

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/public/tables`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      return NextResponse.json(body, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
