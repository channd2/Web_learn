import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPMById, createWO } from '@/lib/db';
import { generateWONumber } from '@/lib/utils';

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const pm = await getPMById(id);
    if (!pm) return NextResponse.json({ error: 'PM not found' }, { status: 404 });

    const wo = await createWO({
      wo_number: generateWONumber(),
      asset_id: pm.asset_id,
      pm_id: pm.id,
      type: 'PM',
      title: `PM: ${pm.name}`,
      description: pm.description,
      status: 'OPEN',
      priority: 'MEDIUM',
      total_cost: 0,
    });

    return NextResponse.json(wo, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
