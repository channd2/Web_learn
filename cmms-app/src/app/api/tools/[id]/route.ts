import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getToolById, updateTool, deleteTool } from '@/lib/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const tool = await getToolById(id);
  if (!tool) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(tool);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    const body = await req.json();
    const tool = await updateTool(id, {
      tool_number: body.tool_number,
      name: body.name,
      description: body.description || null,
      purchase_date: body.purchase_date || null,
      status: body.status,
      photo_url: body.photo_url || null,
      ...(body.capex !== '' && body.capex != null ? { capex: parseFloat(body.capex) } : { capex: null }),
    });
    return NextResponse.json(tool);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  try {
    await deleteTool(id);
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
