import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPMById, updatePM, deletePM } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const pm = await getPMById(id);
    if (!pm) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pm);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const pm = await updatePM(id, {
      ...body,
      frequency_days: body.frequency_days ? parseInt(body.frequency_days) : undefined,
      frequency_km: body.frequency_km ? parseFloat(body.frequency_km) : undefined,
      last_completed_date: body.last_completed_date || undefined,
      last_completed_km: body.last_completed_km ? parseFloat(body.last_completed_km) : undefined,
    });
    return NextResponse.json(pm);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await deletePM(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
