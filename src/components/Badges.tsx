import type { PriorityLevel, StatusCategory } from '@/types/schema';

const priorityStyles: Record<PriorityLevel, string> = {
  critical: 'bg-priority-critical text-destructive-foreground animate-pulse-soft',
  high: 'bg-priority-high text-warning-foreground',
  medium: 'bg-priority-medium text-warning-foreground',
  low: 'bg-priority-low text-success-foreground',
  normal: 'bg-muted text-muted-foreground',
};

const priorityLabels: Record<PriorityLevel, string> = {
  critical: '긴급', high: '높음', medium: '보통', low: '낮음', normal: '정상',
};

export function PriorityBadge({ level }: { level: PriorityLevel }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${priorityStyles[level]}`}>
      {priorityLabels[level]}
    </span>
  );
}

const statusStyles: Record<StatusCategory, string> = {
  '활동미감지': 'bg-status-activity-missing/15 text-status-activity-missing border border-status-activity-missing/30',
  '장기외출': 'bg-status-long-outing/15 text-status-long-outing border border-status-long-outing/30',
  '장기부재': 'bg-status-long-absence/15 text-status-long-absence border border-status-long-absence/30',
  '비정상장비': 'bg-status-abnormal-device/15 text-status-abnormal-device border border-status-abnormal-device/30',
};

export function StatusBadge({ status }: { status: StatusCategory }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

export function NewBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-danger text-danger-foreground">
      NEW
    </span>
  );
}
