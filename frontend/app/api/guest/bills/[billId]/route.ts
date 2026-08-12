import { NextRequest, NextResponse } from 'next/server';
import { guestApiFetch, ApiError } from '../../../../../lib/api/guest';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ billId: string }> },
) {
  const { billId } = await params;

  try {
    const cookieHeader = req.headers.get('cookie') ?? undefined;

    const { data } = await guestApiFetch(`/guest/bills/${billId}`, {
      method: 'GET',
      cookieHeader,
    });

    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
