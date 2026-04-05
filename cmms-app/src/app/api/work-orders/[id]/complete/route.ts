import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getWOById, updateWO, resetPMAfterCompletion, updateAsset } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await req.json();
    const wo = await getWOById(id);
    if (!wo) return NextResponse.json({ error: 'WO not found' }, { status: 404 });
    if (wo.status === 'COMP') return NextResponse.json({ error: 'WO already completed' }, { status: 400 });

    const completedAt = new Date().toISOString();
    const updatedWO = await updateWO(id, {
      status: 'COMP',
      end_time: completedAt,
      comments: body.comments ?? wo.comments,
    });

    // Reset PM if linked
    if (wo.pm_id) {
      const meterReading = body.meter_reading;
      await resetPMAfterCompletion(wo.pm_id, completedAt, meterReading);

      // Update asset meter reading if provided
      if (meterReading && wo.asset_id) {
        await updateAsset(wo.asset_id, { meter_reading: parseFloat(meterReading) });
      }
    }

    return NextResponse.json(updatedWO);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
