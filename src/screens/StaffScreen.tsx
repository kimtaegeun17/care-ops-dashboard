import { useAppState } from '@/context/AppContext';
import { PriorityBadge, StatusBadge } from '@/components/Badges';

export default function StaffScreen() {
  const { staffSummary, cases, setScreen, setStatusFilter } = useAppState();

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-6">담당자별 점검현황</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        {staffSummary.map(s => (
          <div key={s.staff} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">{s.staff}</h3>
                <p className="text-xs text-muted-foreground">{s.region}</p>
              </div>
              <span className="text-2xl font-bold text-primary">{s.totalCases}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-danger/10 rounded p-2">
                <p className="text-lg font-bold text-danger">{s.criticalCases}</p>
                <p className="text-[10px] text-muted-foreground">긴급/높음</p>
              </div>
              <div className="bg-success/10 rounded p-2">
                <p className="text-lg font-bold text-success">{s.completedCases}</p>
                <p className="text-[10px] text-muted-foreground">조치완료</p>
              </div>
              <div className="bg-muted rounded p-2">
                <p className="text-lg font-bold text-muted-foreground">{s.pendingCases}</p>
                <p className="text-[10px] text-muted-foreground">미조치</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Per-staff detail tables */}
      {staffSummary.map(s => {
        const staffCases = cases.filter(c => c.person.staff === s.staff);
        if (staffCases.length === 0) return null;
        return (
          <div key={s.staff} className="mb-6">
            <h3 className="text-sm font-bold text-foreground mb-2">{s.staff} ({s.region}) - {staffCases.length}건</h3>
            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-table-header text-table-header-foreground">
                    {['순번','대상자명','상태','세부이상','경과시간','우선순위','조치','결과'].map(h => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {staffCases.map((c, i) => (
                    <tr key={c.id} className={i % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'}>
                      <td className="px-3 py-2 text-xs">{i + 1}</td>
                      <td className="px-3 py-2 text-xs font-semibold text-foreground">{c.person.name}</td>
                      <td className="px-3 py-2"><div className="flex gap-1">{c.statuses.map(st => <StatusBadge key={st} status={st} />)}</div></td>
                      <td className="px-3 py-2 text-xs text-foreground">{c.detailText}</td>
                      <td className="px-3 py-2 text-xs text-foreground">{c.elapsedTime}</td>
                      <td className="px-3 py-2"><PriorityBadge level={c.priority} /></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.actionMethod || '-'}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{c.result || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
