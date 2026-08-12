import { NextResponse } from 'next/server';
import { getMe } from '../../../../lib/api/auth';
import { ApiError } from '../../../../lib/api/client';
import { getSessionToken } from '../../../../lib/auth/session';

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    const user = await getMe(token);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
