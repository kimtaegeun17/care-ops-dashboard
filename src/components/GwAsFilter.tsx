import { useMemo } from 'react';
import type { CaseRecord } from '@/types/schema';

interface GwAsFilterProps {
  cases: CaseRecord[];
  value: string;
  onChange: (v: string) => void;
}

export default function GwAsFilter({ cases, value, onChange }: GwAsFilterProps) {
  const options = useMemo(() => {
    const set = new Set<string>();
    cases.forEach(c => { if (c.gwAs) set.add(c.gwAs); });
    return Array.from(set).sort();
  }, [cases]);

  if (options.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground whitespace-nowrap">G/W AS:</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="text-xs px-2 py-1 border border-input rounded bg-card text-foreground"
      >
        <option value="">전체</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__none__">없음</option>
      </select>
    </div>
  );
}

export function filterByGwAs(cases: CaseRecord[], gwAsFilter: string): CaseRecord[] {
  if (!gwAsFilter) return cases;
  if (gwAsFilter === '__none__') return cases.filter(c => !c.gwAs);
  return cases.filter(c => c.gwAs === gwAsFilter);
}
