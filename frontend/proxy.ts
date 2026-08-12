import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'session_token';
const PROTECTED_PREFIXES = ['/tables', '/menu-items', '/orders'];
const PUBLIC_PREFIXES = ['/guest'];

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const isPublic = PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isPublic) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tables/:path*', '/menu-items/:path*', '/orders/:path*'],
};
