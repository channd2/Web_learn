import AppShell from '@/components/layout/AppShell';
import AssetDetailClient from './AssetDetailClient';

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <AppShell>
      <AssetDetailClient params={params} />
    </AppShell>
  );
}
