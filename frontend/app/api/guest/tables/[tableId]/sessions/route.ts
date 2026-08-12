import { NextRequest, NextResponse } from 'next/server';
import { guestApiFetch, ApiError } from '../../../../../../lib/api/guest';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const { tableId } = await params;

  try {
    const body = await req.json();
    const cookieHeader = req.headers.get('cookie') ?? undefined;

    const { data, setCookie } = await guestApiFetch(
      `/guest/tables/${tableId}/sessions`,
      {
        method: 'POST',
        body: JSON.stringify(body),
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
