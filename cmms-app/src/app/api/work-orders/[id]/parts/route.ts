import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { addWOPart, deleteWOPart, updateWOTotalCost } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const part = await addWOPart({
      wo_id: id,
      part_name: body.part_name,
      quantity: parseFloat(body.quantity) || 1,
      unit_price: parseFloat(body.unit_price) || 0,
    });
    await updateWOTotalCost(id);
    return NextResponse.json(part, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const { partId } = await req.json();
    await deleteWOPart(partId);
    await updateWOTotalCost(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
