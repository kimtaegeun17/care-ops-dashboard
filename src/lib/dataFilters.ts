import type { CaseRecord, DailyData } from '@/types/schema';

const SIX_HOURS = 360; // minutes

/** Filter activity missing to 6h+ only */
export function filterActivity6h(cases: CaseRecord[]): CaseRecord[] {
  return cases.filter(c => c.elapsedMinutes >= SIX_HOURS);
}

/** Filter long outing to 6h+ only */
export function filterOuting6h(cases: CaseRecord[]): CaseRecord[] {
  return cases.filter(c => c.elapsedMinutes >= SIX_HOURS);
}

/**
 * Deduplicate abnormal devices:
 * If a person has 게이트웨이 전원차단, sensors depend on the gateway,
 * so only show the gateway entry (remove sensor entries for same person).
 */
export function deduplicateDevices(cases: CaseRecord[]): CaseRecord[] {
  // Find all persons who have 게이트웨이 전원차단
  const gwPersonKeys = new Set<string>();
  for (const c of cases) {
    if (c.deviceTag === '게이트웨이 전원차단') {
      gwPersonKeys.add(`${c.person.name}_${c.person.birthDate}`);
    }
  }

  // Keep only gateway entry for those persons, keep all for others
  return cases.filter(c => {
    const key = `${c.person.name}_${c.person.birthDate}`;
    if (gwPersonKeys.has(key) && c.deviceTag !== '게이트웨이 전원차단') {
      return false; // Remove sensor entries when gateway is down
    }
    return true;
  });
}

/** Get filtered view of daily data for display */
export function getFilteredData(data: DailyData) {
  return {
    activityMissing: filterActivity6h(data.activityMissing),
    longOuting: filterOuting6h(data.longOuting),
    longAbsence: data.longAbsence,
    abnormalDevice: deduplicateDevices(data.abnormalDevice),
    asRecords: data.asRecords,
  };
}

