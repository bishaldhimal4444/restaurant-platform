import { NextRequest, NextResponse } from 'next/server';
import { login } from '../../../../lib/api/auth';
import { ApiError } from '../../../../lib/api/client';
import { COOKIE_NAME, SESSION_COOKIE_OPTIONS } from '../../../../lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await login(body);

    const response = NextResponse.json({ user: result.user });
    response.cookies.set(COOKIE_NAME, result.accessToken, SESSION_COOKIE_OPTIONS);
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
