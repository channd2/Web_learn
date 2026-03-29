import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAssets, createAsset } from '@/lib/db';
import { generateAssetNumber } from '@/lib/utils';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const assets = await getAssets();
    return NextResponse.json(assets);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const asset = await createAsset({
      asset_number: body.asset_number || generateAssetNumber(),
      name: body.name,
      description: body.description,
      date_of_birth: body.date_of_birth || null,
      meter_reading: parseFloat(body.meter_reading) || 0,
      status: body.status || 'ACTIVE',
      photo_url: body.photo_url || null,
      capex: body.capex !== '' && body.capex != null ? parseFloat(body.capex) : null,
    });
    return NextResponse.json(asset, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
