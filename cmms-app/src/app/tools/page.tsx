import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ToolsClient from './ToolsClient';

export default async function ToolsPage() {
  const session = await getSession();
  if (!session) redirect('/login');
  return <ToolsClient />;
}
