import { cookies } from 'next/headers';

const COOKIE_NAME = 'session_token';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  // maxAge removed → session cookie (expires when browser closes)
};

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

export { COOKIE_NAME };
