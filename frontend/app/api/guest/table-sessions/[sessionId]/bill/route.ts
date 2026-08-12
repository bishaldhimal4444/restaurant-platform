import { NextRequest, NextResponse } from 'next/server';
import { guestApiFetch, ApiError } from '../../../../../../lib/api/guest';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  try {
    const cookieHeader = req.headers.get('cookie') ?? undefined;

    const { data, setCookie } = await guestApiFetch(
      `/guest/table-sessions/${sessionId}/bill`,
      {
        method: 'POST',
        cookieHeader,
      },
    );

    const response = NextResponse.json(data);
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
