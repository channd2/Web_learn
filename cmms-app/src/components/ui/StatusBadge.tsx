import { WOStatus, AssetStatus, PMStatus } from '@/types';
import { PMStatusLabel } from '@/lib/utils';

type BadgeType = WOStatus | AssetStatus | PMStatus | PMStatusLabel | 'LOW' | 'MEDIUM' | 'HIGH' | 'PM' | 'ADHOC';

const badgeMap: Record<string, string> = {
  // WO Status
  OPEN: 'status-open',
  IN_PROGRESS: 'status-in-progress',
  COMP: 'status-comp',
  // Asset Status
  ACTIVE: 'status-active',
  INACTIVE: 'status-inactive',
  RETIRED: 'status-retired',
  // PM Status labels
  OVERDUE: 'status-overdue',
  DUE_SOON: 'status-due-soon',
  UPCOMING: 'status-upcoming',
  OK: 'status-ok',
  // Priority
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  // Type
  PM: 'status-open',
  ADHOC: 'status-inactive',
};

const labelMap: Record<string, string> = {
  IN_PROGRESS: 'In Progress',
  COMP: 'Completed',
  DUE_SOON: 'Due Soon',
  ADHOC: 'Ad-hoc',
};

interface Props {
  value: BadgeType;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ value, size = 'md' }: Props) {
  const cls = badgeMap[value] || 'status-inactive';
  const label = labelMap[value] || value;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full ${sizeClass} ${cls}`}>
      {label}
    </span>
  );
}
