import { PMStatusLabel } from '@/lib/utils';

interface Props {
  percent: number;
  statusLabel: PMStatusLabel;
  showLabel?: boolean;
}

const colorMap: Record<PMStatusLabel, string> = {
  OK: 'progress-bar-ok',
  UPCOMING: 'progress-bar-upcoming',
  DUE_SOON: 'progress-bar-due-soon',
  OVERDUE: 'progress-bar-overdue',
};

export default function ProgressBar({ percent, statusLabel, showLabel = false }: Props) {
  const width = Math.max(0, Math.min(100, percent));
  const colorClass = colorMap[statusLabel];

  return (
    <div className="w-full">
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${width}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mt-1">
          <span>{Math.round(percent)}% remaining</span>
        </div>
      )}
    </div>
  );
}
