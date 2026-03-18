import AppShell from '@/components/layout/AppShell';
import PMDetailClient from './PMDetailClient';

export default function PMDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell>
      <PMDetailClient params={params} />
    </AppShell>
  );
}
