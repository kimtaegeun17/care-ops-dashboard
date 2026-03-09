import type { StatusCategory, DeviceTag, PriorityLevel } from '@/types/schema';

export function calculatePriority(
  statuses: StatusCategory[],
  deviceTags: DeviceTag[],
  elapsedMinutes: number
): { score: number; level: PriorityLevel } {
  let score = 0;

  // Status base scores
  if (statuses.includes('활동미감지')) score += 40;
  if (statuses.includes('장기부재')) score += 15;
  if (statuses.includes('장기외출')) score += 10;
  if (statuses.includes('비정상장비')) score += 20;

  // Combo bonus: activity missing + device abnormal = high risk
  if (statuses.includes('활동미감지') && statuses.includes('비정상장비')) score += 25;

  // Device tag accumulation
  score += Math.min(deviceTags.length * 8, 30);

  // Time escalation
  if (elapsedMinutes > 1440) score += 15;      // > 1 day
  else if (elapsedMinutes > 480) score += 10;   // > 8 hours
  else if (elapsedMinutes > 120) score += 5;    // > 2 hours

  let level: PriorityLevel = 'normal';
  if (score >= 70) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 30) level = 'medium';
  else if (score >= 15) level = 'low';

  return { score, level };
}

export function priorityLabel(level: PriorityLevel): string {
  const map: Record<PriorityLevel, string> = {
    critical: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
    normal: '정상',
  };
  return map[level];
}

export function statusLabel(status: StatusCategory): string {
  return status;
}
