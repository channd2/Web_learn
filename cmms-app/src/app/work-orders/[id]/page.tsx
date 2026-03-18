import AppShell from '@/components/layout/AppShell';
import WODetailClient from './WODetailClient';

export default function WODetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell>
      <WODetailClient params={params} />
    </AppShell>
  );
}
