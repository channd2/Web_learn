import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPMSchedules, createPM } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const assetId = req.nextUrl.searchParams.get('assetId') || undefined;
    const pms = await getPMSchedules(assetId);
    return NextResponse.json(pms);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const pm = await createPM({
      asset_id: body.asset_id,
      name: body.name,
      description: body.description,
      frequency_type: body.frequency_type,
      frequency_days: body.frequency_days ? parseInt(body.frequency_days) : undefined,
      frequency_km: body.frequency_km ? parseFloat(body.frequency_km) : undefined,
      last_completed_date: body.last_completed_date || undefined,
      last_completed_km: body.last_completed_km ? parseFloat(body.last_completed_km) : undefined,
      status: 'ACTIVE',
    });
    return NextResponse.json(pm, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
