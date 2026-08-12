import { NextRequest, NextResponse } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '../../../../lib/api/menu-items';
import { ApiError } from '../../../../lib/api/client';
import { getSessionToken } from '../../../../lib/auth/session';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const item = await updateMenuItem(token, id, body);
    return NextResponse.json(item);
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteMenuItem(token, id);
    return NextResponse.json({ deleted: true });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
