import { useMemo, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { PriorityBadge, StatusBadge, NewBadge } from '@/components/Badges';
import { Search } from 'lucide-react';
import type { CaseRecord, ActionMethod, ActionResult } from '@/types/schema';

const actionMethods: ActionMethod[] = ['전화확인', '방문확인', 'A/S접수', '119신고', '보호자연락', '기타'];
const actionResults: ActionResult[] = ['확인완료', '미확인', '조치완료', '조치중', '대기'];

export default function UnifiedTableScreen() {
  const { cases, searchQuery, setSearchQuery, statusFilter, setStatusFilter, updateCase } = useAppState();
  const [staffFilter, setStaffFilter] = useState('all');

  const staffList = useMemo(() => Array.from(new Set(cases.map(c => c.person.staff))).filter(Boolean), [cases]);

  const filtered = useMemo(() => {
    return cases.filter(c => {
      if (statusFilter !== 'all' && !c.statuses.includes(statusFilter as any)) return false;
      if (staffFilter !== 'all' && c.person.staff !== staffFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.person.name.includes(q) || c.person.address.includes(q) || c.detailText.includes(q);
      }
      return true;
    });
  }, [cases, statusFilter, staffFilter, searchQuery]);

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-4">전체 일일점검현황</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 no-print">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="이름, 주소, 상태 검색..."
            className="pl-9 pr-4 py-2 border border-input rounded-lg text-sm bg-card text-foreground w-64 focus:ring-2 focus:ring-ring focus:outline-none"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-card text-foreground">
          <option value="all">전체 상태</option>
          <option value="활동미감지">활동미감지</option>
          <option value="장기외출">장기외출</option>
          <option value="장기부재">장기부재</option>
          <option value="비정상장비">비정상장비</option>
        </select>
        <select value={staffFilter} onChange={e => setStaffFilter(e.target.value)}
          className="px-3 py-2 border border-input rounded-lg text-sm bg-card text-foreground">
          <option value="all">전체 담당자</option>
          {staffList.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="flex items-center text-sm text-muted-foreground ml-auto">
          총 {filtered.length}건
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {['순번','권역','담당자','대상자명','생년월일','연락처','상태구분','세부이상','최초감지시각','경과시간','우선순위','조치방법','결과','비고'].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((c, i) => (
              <CaseRow key={c.id} c={c} index={i + 1} updateCase={updateCase} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseRow({ c, index, updateCase }: { c: CaseRecord; index: number; updateCase: (id: string, u: Partial<CaseRecord>) => void }) {
  return (
    <tr className={`${index % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'} hover:bg-table-row-hover transition-colors`}>
      <td className="px-3 py-2 text-xs text-foreground">{index}</td>
      <td className="px-3 py-2 text-xs text-foreground whitespace-nowrap">{c.person.region}</td>
      <td className="px-3 py-2 text-xs text-foreground whitespace-nowrap">{c.person.staff}</td>
      <td className="px-3 py-2 text-xs font-semibold text-foreground whitespace-nowrap">
        {c.isNew && <NewBadge />} {c.person.name}
      </td>
      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.birthDate}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.phone}</td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {c.statuses.map(s => <StatusBadge key={s} status={s} />)}
        </div>
      </td>
      <td className="px-3 py-2 text-xs text-foreground max-w-[200px] truncate">{c.detailText}</td>
      <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.firstDetected}</td>
      <td className="px-3 py-2 text-xs text-foreground font-medium whitespace-nowrap">{c.elapsedTime}</td>
      <td className="px-3 py-2"><PriorityBadge level={c.priority} /></td>
      <td className="px-3 py-2">
        <select
          value={c.actionMethod}
          onChange={e => updateCase(c.id, { actionMethod: e.target.value as ActionMethod })}
          className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground"
        >
          <option value="">선택</option>
          {actionMethods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={c.result}
          onChange={e => updateCase(c.id, { result: e.target.value as ActionResult })}
          className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground"
        >
          <option value="">선택</option>
          {actionResults.map(r => <option key={r} value={r}>{r}</option>)}
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
  );
}
