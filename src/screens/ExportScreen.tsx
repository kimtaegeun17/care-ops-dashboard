import { useState, useMemo } from 'react';
import { useAppState, type DeviceSortKey } from '@/context/AppContext';
import { exportFullReport, printTable } from '@/lib/exportEngine';
import { extractDistrict, sortDevicesByKey } from '@/lib/addressUtils';
import { Printer, FileSpreadsheet, ArrowUpDown, Trash2, Undo2 } from 'lucide-react';
import type { CaseRecord } from '@/types/schema';

type SectionKey = 'activityMissing' | 'longOuting' | 'longAbsence' | 'abnormalDevice';

export default function ExportScreen() {
  const { filtered, deviceSortKey, setDeviceSortKey } = useAppState();
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.(${dayNames[today.getDay()]})`;

  // 섹션별로 숨긴 행 ID 관리 (삭제 순서대로 stack)
  const [hidden, setHidden] = useState<Record<SectionKey, string[]>>({
    activityMissing: [],
    longOuting: [],
    longAbsence: [],
    abnormalDevice: [],
  });

  const hideRow = (section: SectionKey, id: string) => {
    setHidden(prev => ({ ...prev, [section]: [...prev[section], id] }));
  };

  const undoRow = (section: SectionKey) => {
    setHidden(prev => ({ ...prev, [section]: prev[section].slice(0, -1) }));
  };

  const totalHidden = Object.values(hidden).reduce((sum, arr) => sum + arr.length, 0);
  const undoAll = () => setHidden({ activityMissing: [], longOuting: [], longAbsence: [], abnormalDevice: [] });

  const visibleActivity = useMemo(() => filtered.activityMissing.filter(c => !hidden.activityMissing.includes(c.id)), [filtered.activityMissing, hidden.activityMissing]);
  const visibleOuting = useMemo(() => filtered.longOuting.filter(c => !hidden.longOuting.includes(c.id)), [filtered.longOuting, hidden.longOuting]);
  const visibleAbsence = useMemo(() => filtered.longAbsence.filter(c => !hidden.longAbsence.includes(c.id)), [filtered.longAbsence, hidden.longAbsence]);
  const visibleDevices = useMemo(
    () => sortDevicesByKey(filtered.abnormalDevice.filter(c => !hidden.abnormalDevice.includes(c.id)), deviceSortKey),
    [filtered.abnormalDevice, hidden.abnormalDevice, deviceSortKey]
  );

  const handleExport = () => {
    exportFullReport(visibleActivity, visibleOuting, visibleAbsence, visibleDevices, dateLabel);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">인쇄 / 내보내기</h2>
          <p className="text-sm text-muted-foreground">
            일일점검현황 {dateLabel}
            {totalHidden > 0 && <span className="ml-2 text-destructive">· {totalHidden}개 행 숨김</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalHidden > 0 && (
            <button onClick={undoAll} className="flex items-center gap-1.5 px-3 py-2 bg-muted text-foreground rounded-lg text-sm font-medium hover:opacity-90">
              <Undo2 className="w-4 h-4" /> 전체 되돌리기
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <FileSpreadsheet className="w-4 h-4" /> Excel 내보내기
          </button>
          <button onClick={printTable} className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Printer className="w-4 h-4" /> 인쇄
          </button>
        </div>
      </div>

      <div className="print-area bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <h3 className="text-sm font-bold text-foreground text-center">일일점검대상자 {dateLabel}</h3>
        </div>

        <SectionTable
          sectionTitle="활동미감지6시간이상"
          columns={['대상자명', '출생년도', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']}
          cases={visibleActivity}
          headerColor="bg-danger/10"
          hiddenCount={hidden.activityMissing.length}
          onDelete={(id) => hideRow('activityMissing', id)}
          onUndo={() => undoRow('activityMissing')}
        />

        <SectionTable
          sectionTitle="장기외출"
          columns={['대상자명', '출생년도', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']}
          cases={visibleOuting}
          headerColor="bg-warning/10"
          hiddenCount={hidden.longOuting.length}
          onDelete={(id) => hideRow('longOuting', id)}
          onUndo={() => undoRow('longOuting')}
        />

        <SectionTable
          sectionTitle="장기부재"
          columns={['대상자명', '생년월일', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작일', '지속기간']}
          cases={visibleAbsence}
          headerColor="bg-status-long-absence/10"
          hiddenCount={hidden.longAbsence.length}
          onDelete={(id) => hideRow('longAbsence', id)}
          onUndo={() => undoRow('longAbsence')}
        />

        <DeviceTable
          cases={visibleDevices}
          sortKey={deviceSortKey}
          onSortChange={setDeviceSortKey}
          hiddenCount={hidden.abnormalDevice.length}
          onDelete={(id) => hideRow('abnormalDevice', id)}
          onUndo={() => undoRow('abnormalDevice')}
        />
      </div>
    </div>
  );
}

interface RowActionsProps {
  hiddenCount: number;
  onDelete: (id: string) => void;
  onUndo: () => void;
}

function SectionTable({ sectionTitle, columns, cases, headerColor, hiddenCount, onDelete, onUndo }: {
  sectionTitle: string;
  columns: string[];
  cases: CaseRecord[];
  headerColor: string;
} & RowActionsProps) {
  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className={headerColor}>
            <th className="print-cell w-6"></th>
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>
              <span className="inline-flex items-center gap-2">
                {sectionTitle}
                {hiddenCount > 0 && (
                  <button
                    onClick={onUndo}
                    className="no-print inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/70 text-muted-foreground font-normal"
                    title="마지막 삭제 되돌리기"
                  >
                    <Undo2 className="w-3 h-3" /> 되돌리기 ({hiddenCount})
                  </button>
                )}
              </span>
            </th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>감지정보</th>
            <th className="print-cell w-8 no-print"></th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell w-6"></th>
            <th className="print-cell w-6"></th>
            {columns.map((col, i) => (
              <th key={i} className="print-cell text-left font-semibold text-foreground whitespace-nowrap">{col}</th>
            ))}
            <th className="print-cell w-8 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={12} className="print-cell text-center text-muted-foreground py-1">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? 'group' : 'bg-muted/20 group'}>
                <td className="print-cell"></td>
                <td className="print-cell text-center">{i + 1}</td>
                <td className="print-cell font-semibold whitespace-nowrap">{c.person.name}</td>
                <td className="print-cell whitespace-nowrap">{c.person.birthDate}</td>
                <td className="print-cell whitespace-nowrap">{extractDistrict(c.person.address)}</td>
                <td className="print-cell whitespace-nowrap">{c.person.phone}</td>
                <td className="print-cell whitespace-nowrap">{c.person.gwNumber}</td>
                <td className="print-cell whitespace-nowrap">{c.person.order}</td>
                <td className="print-cell whitespace-nowrap">{c.gwAs || ''}</td>
                <td className="print-cell whitespace-nowrap">{c.detectedTime}</td>
                <td className="print-cell font-medium whitespace-nowrap">{c.elapsedTime}</td>
                <td className="print-cell no-print text-center">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="opacity-40 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="이 행 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeviceTable({ cases, sortKey, onSortChange, hiddenCount, onDelete, onUndo }: {
  cases: CaseRecord[];
  sortKey: DeviceSortKey;
  onSortChange: (k: DeviceSortKey) => void;
} & RowActionsProps) {
  const SortHeader = ({ label, colKey }: { label: string; colKey: DeviceSortKey }) => (
    <th
      className="print-cell text-left font-semibold cursor-pointer hover:text-primary select-none"
      onClick={() => onSortChange(colKey)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        <ArrowUpDown className={`w-3 h-3 no-print ${sortKey === colKey ? 'text-primary' : 'text-muted-foreground/50'}`} />
      </span>
    </th>
  );

  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className="bg-info/10">
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>
              <span className="inline-flex items-center gap-2">
                비정상장비
                {hiddenCount > 0 && (
                  <button
                    onClick={onUndo}
                    className="no-print inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-muted hover:bg-muted/70 text-muted-foreground font-normal"
                    title="마지막 삭제 되돌리기"
                  >
                    <Undo2 className="w-3 h-3" /> 되돌리기 ({hiddenCount})
                  </button>
                )}
              </span>
            </th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={3}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>이상정보</th>
            <th className="print-cell w-8 no-print"></th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell text-left font-semibold w-6">비</th>
            <SortHeader label="장비이상" colKey="deviceTag" />
            <SortHeader label="대상자명" colKey="name" />
            <th className="print-cell text-left font-semibold">생년월일</th>
            <SortHeader label="도로명주소" colKey="address" />
            <th className="print-cell text-left font-semibold">핸드폰번호</th>
            <th className="print-cell text-left font-semibold">G/W번호</th>
            <th className="print-cell text-left font-semibold">차수</th>
            <th className="print-cell text-left font-semibold">G/W AS</th>
            <th className="print-cell text-left font-semibold">시작시각</th>
            <th className="print-cell text-left font-semibold">지속시간</th>
            <th className="print-cell w-8 no-print"></th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={12} className="print-cell text-center text-muted-foreground py-1">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? 'group' : 'bg-muted/20 group'}>
                <td className="print-cell text-center font-bold text-info">비</td>
                <td className="print-cell whitespace-nowrap">{c.deviceTag || '-'}</td>
                <td className="print-cell font-semibold whitespace-nowrap">{c.person.name}</td>
                <td className="print-cell whitespace-nowrap">{c.person.birthDate}</td>
                <td className="print-cell whitespace-nowrap">{extractDistrict(c.person.address)}</td>
                <td className="print-cell whitespace-nowrap">{c.person.phone}</td>
                <td className="print-cell whitespace-nowrap">{c.person.gwNumber}</td>
                <td className="print-cell whitespace-nowrap">{c.person.order}</td>
                <td className="print-cell whitespace-nowrap">{c.gwAs || ''}</td>
                <td className="print-cell whitespace-nowrap">{c.detectedTime}</td>
                <td className="print-cell font-medium whitespace-nowrap">{c.elapsedTime}</td>
                <td className="print-cell no-print text-center">
                  <button
                    onClick={() => onDelete(c.id)}
                    className="opacity-40 group-hover:opacity-100 hover:text-destructive transition-opacity"
                    title="이 행 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
