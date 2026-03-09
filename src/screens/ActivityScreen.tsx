import { useAppState } from '@/context/AppContext';
import type { CaseRecord, ActionMethod, ActionResult } from '@/types/schema';

const actionMethods: ActionMethod[] = ['전화확인', '방문확인', 'A/S접수', '119신고', '보호자연락', '기타'];
const actionResults: ActionResult[] = ['확인완료', '미확인', '조치완료', '조치중', '대기'];

export default function ActivityScreen() {
  const { filtered, updateCase } = useAppState();
  const cases = filtered.activityMissing;

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-1">활동미감지 6시간 이상</h2>
      <p className="text-sm text-muted-foreground mb-4">{cases.length}건</p>

      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {['', '대상자명', '출생년도', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '시작시각', '지속시간', '조치방법', '결과', '비고'].map(h => (
                <th key={h} className="px-2 py-2 text-left text-xs font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c, i) => (
              <CaseRow key={c.id} c={c} index={i + 1} updateCase={(id, u) => updateCase('activityMissing', id, u)} />
            ))}
            {cases.length === 0 && (
              <tr><td colSpan={13} className="px-4 py-8 text-center text-muted-foreground">데이터 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CaseRow({ c, index, updateCase }: { c: CaseRecord; index: number; updateCase: (id: string, u: Partial<CaseRecord>) => void }) {
  return (
    <tr className={`${index % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'} hover:bg-table-row-hover transition-colors`}>
      <td className="px-2 py-2 text-xs text-foreground">{index}</td>
      <td className="px-2 py-2 text-xs font-semibold text-foreground whitespace-nowrap">{c.person.name}</td>
      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.birthDate}</td>
      <td className="px-2 py-2 text-xs text-foreground max-w-[180px] truncate">{c.person.address}</td>
      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.phone}</td>
      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.gwNumber}</td>
      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.person.order}</td>
      <td className="px-2 py-2 text-xs">
        {c.gwAs && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-warning/15 text-warning">{c.gwAs}</span>}
      </td>
      <td className="px-2 py-2 text-xs text-muted-foreground whitespace-nowrap">{c.detectedTime}</td>
      <td className="px-2 py-2 text-xs font-medium text-danger whitespace-nowrap">{c.elapsedTime}</td>
      <td className="px-2 py-2">
        <select
          value={c.actionMethod}
          onChange={e => updateCase(c.id, { actionMethod: e.target.value as ActionMethod })}
          className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground"
        >
          <option value="">선택</option>
          {actionMethods.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </td>
      <td className="px-2 py-2">
        <select
          value={c.result}
          onChange={e => updateCase(c.id, { result: e.target.value as ActionResult })}
          className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground"
        >
          <option value="">선택</option>
          {actionResults.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          value={c.note}
          onChange={e => updateCase(c.id, { note: e.target.value })}
          placeholder="비고"
          className="text-xs px-1.5 py-1 border border-input rounded bg-card text-foreground w-20"
        />
      </td>
    </tr>
  );
}
