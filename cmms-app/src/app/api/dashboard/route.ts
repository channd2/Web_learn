import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDashboardStats } from '@/lib/db';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
