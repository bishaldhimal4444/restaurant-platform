import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:4000';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const res = await fetch(`${API_URL}/guest/tables/table-sessions/${sessionId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Cookie: req.headers.get('cookie') || '',
    },
    credentials: 'include',
  });
  const data = await res.text();
  const response = new NextResponse(data, {
    status: res.status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  // Relay set-cookie if backend sets any
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) {
    response.headers.set('set-cookie', setCookie);
  }
  return response;
}
