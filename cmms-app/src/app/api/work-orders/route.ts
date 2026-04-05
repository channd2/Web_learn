import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWorkOrders, createWO } from '@/lib/db';
import { generateWONumber } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const searchParams = req.nextUrl.searchParams;
    const wos = await getWorkOrders({
      assetId: searchParams.get('assetId') || undefined,
      pmId: searchParams.get('pmId') || undefined,
      status: searchParams.get('status') || undefined,
    });
    return NextResponse.json(wos);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const wo = await createWO({
      wo_number: generateWONumber(),
      asset_id: body.asset_id,
      pm_id: body.pm_id || null,
      type: body.type || 'ADHOC',
      title: body.title,
      description: body.description,
      status: 'OPEN',
      priority: body.priority || 'MEDIUM',
      total_cost: 0,
    });
    return NextResponse.json(wo, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
