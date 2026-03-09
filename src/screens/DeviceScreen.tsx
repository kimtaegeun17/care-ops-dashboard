import { useMemo } from 'react';
import { useAppState } from '@/context/AppContext';
import { PriorityBadge } from '@/components/Badges';

export default function DeviceScreen() {
  const { cases, updateCase } = useAppState();

  const deviceCases = useMemo(
    () => cases.filter(c => c.statuses.includes('비정상장비')).sort((a, b) => b.priorityScore - a.priorityScore),
    [cases]
  );

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">비정상장비 관리표</h2>
      <p className="text-sm text-muted-foreground mb-6">비정상장비 대상자 {deviceCases.length}명</p>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {['순번','권역','담당자','대상자명','G/W번호','장비이상내역','경과시간','우선순위','A/S상태','비고'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deviceCases.map((c, i) => (
              <tr key={c.id} className={`${i % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'} hover:bg-table-row-hover`}>
                <td className="px-3 py-2 text-xs">{i + 1}</td>
                <td className="px-3 py-2 text-xs">{c.person.region}</td>
                <td className="px-3 py-2 text-xs">{c.person.staff}</td>
                <td className="px-3 py-2 text-xs font-semibold text-foreground">{c.person.name}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{c.person.gwNumber || '-'}</td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {c.deviceTags.map(tag => (
                      <span key={tag} className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-info/15 text-info border border-info/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 text-xs font-medium text-foreground">{c.elapsedTime}</td>
                <td className="px-3 py-2"><PriorityBadge level={c.priority} /></td>
                <td className="px-3 py-2">
                  <select
                    value={c.asStatus || ''}
                    onChange={e => updateCase(c.id, { asStatus: e.target.value })}
                    className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground"
                  >
                    <option value="">미접수</option>
                    <option value="접수중">접수중</option>
                    <option value="처리중">처리중</option>
                    <option value="완료">완료</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    value={c.note}
                    onChange={e => updateCase(c.id, { note: e.target.value })}
                    placeholder="비고"
                    className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground w-24"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
