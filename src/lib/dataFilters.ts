import type { CaseRecord, DailyData } from '@/types/schema';

const SIX_HOURS = 360; // minutes

export function filterActivity6h(cases: CaseRecord[]): CaseRecord[] {
  return cases.filter(c => c.elapsedMinutes >= SIX_HOURS);
}

export function filterOuting6h(cases: CaseRecord[]): CaseRecord[] {
  return cases.filter(c => c.elapsedMinutes >= SIX_HOURS);
}

export function deduplicateDevices(cases: CaseRecord[]): CaseRecord[] {
  const gwPersonKeys = new Set<string>();
  for (const c of cases) {
    if (c.deviceTag === '게이트웨이 전원차단') {
      gwPersonKeys.add(`${c.person.name}_${c.person.birthDate}`);
    }
  }
  return cases.filter(c => {
    const key = `${c.person.name}_${c.person.birthDate}`;
    if (gwPersonKeys.has(key) && c.deviceTag !== '게이트웨이 전원차단') {
      return false;
    }
    return true;
  });
}

export function getFilteredData(data: DailyData) {
  return {
    activityMissing: filterActivity6h(data.activityMissing),
    longOuting: filterOuting6h(data.longOuting),
    longAbsence: data.longAbsence,
    abnormalDevice: deduplicateDevices(data.abnormalDevice),
  };
}
