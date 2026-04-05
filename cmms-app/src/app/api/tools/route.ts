import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getTools, createTool } from '@/lib/db';

let toolCounter = 1;
function generateToolNumber(): string {
  const pad = String(toolCounter++).padStart(4, '0');
  return `TL-${pad}`;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const tools = await getTools();
    return NextResponse.json(tools);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const tool = await createTool({
      tool_number: body.tool_number || generateToolNumber(),
      name: body.name,
      description: body.description || null,
      purchase_date: body.purchase_date || null,
      status: body.status || 'ACTIVE',
      photo_url: body.photo_url || null,
      ...(body.capex !== '' && body.capex != null ? { capex: parseFloat(body.capex) } : {}),
    });
    return NextResponse.json(tool, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
