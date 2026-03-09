import { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { PriorityBadge } from '@/components/Badges';

export default function AbsenceScreen() {
  const { cases, updateCase } = useAppState();

  const absenceCases = useMemo(
    () => cases.filter(c => c.statuses.includes('장기부재') || c.statuses.includes('장기외출'))
      .sort((a, b) => (b.absenceDays || b.elapsedMinutes / 1440) - (a.absenceDays || a.elapsedMinutes / 1440)),
    [cases]
  );

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">장기부재 관리표</h2>
      <p className="text-sm text-muted-foreground mb-6">장기부재 및 장기외출 대상자 {absenceCases.length}명</p>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {['순번','권역','담당자','대상자명','생년월일','연락처','상태','경과일수','최초감지','우선순위','비고'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {absenceCases.map((c, i) => {
              const days = c.absenceDays || Math.floor(c.elapsedMinutes / 1440);
              return (
                <tr key={c.id} className={`${i % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'} hover:bg-table-row-hover`}>
                  <td className="px-3 py-2 text-xs">{i + 1}</td>
                  <td className="px-3 py-2 text-xs">{c.person.region}</td>
                  <td className="px-3 py-2 text-xs">{c.person.staff}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-foreground">{c.person.name}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{c.person.birthDate}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{c.person.phone}</td>
                  <td className="px-3 py-2 text-xs">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                      c.statuses.includes('장기부재')
                        ? 'bg-status-long-absence/15 text-status-long-absence'
                        : 'bg-status-long-outing/15 text-status-long-outing'
                    }`}>
                      {c.statuses.includes('장기부재') ? '장기부재' : '장기외출'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs font-bold text-foreground">
                    <span className={days >= 7 ? 'text-danger' : days >= 3 ? 'text-warning' : 'text-foreground'}>
                      {days}일
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{c.firstDetected}</td>
                  <td className="px-3 py-2"><PriorityBadge level={c.priority} /></td>
                  <td className="px-3 py-2">
                    <input
                      value={c.note}
                      onChange={e => updateCase(c.id, { note: e.target.value })}
                      placeholder="비고"
                      className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground w-28"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
