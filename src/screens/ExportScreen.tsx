import { useAppState } from '@/context/AppContext';
import { exportFullReport, printTable } from '@/lib/exportEngine';
import { extractDistrict } from '@/lib/addressUtils';
import { Printer, FileSpreadsheet } from 'lucide-react';
import type { CaseRecord } from '@/types/schema';

export default function ExportScreen() {
  const { filtered } = useAppState();
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.(${dayNames[today.getDay()]})`;

  const sortedDevices = [...filtered.abnormalDevice].sort((a, b) => a.person.name.localeCompare(b.person.name, 'ko'));

  const handleExport = () => {
    exportFullReport(
      filtered.activityMissing,
      filtered.longOuting,
      filtered.longAbsence,
      sortedDevices,
      dateLabel
    );
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">인쇄 / 내보내기</h2>
          <p className="text-sm text-muted-foreground">일일점검현황 {dateLabel}</p>
        </div>
        <div className="flex gap-2">
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
          cases={filtered.activityMissing}
          headerColor="bg-danger/10"
        />

        <SectionTable
          sectionTitle="장기외출"
          columns={['대상자명', '출생년도', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']}
          cases={filtered.longOuting}
          headerColor="bg-warning/10"
        />

        <SectionTable
          sectionTitle="장기부재"
          columns={['대상자명', '생년월일', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작일', '지속기간']}
          cases={filtered.longAbsence}
          headerColor="bg-status-long-absence/10"
        />

        <DeviceTable cases={sortedDevices} />
      </div>
    </div>
  );
}

function SectionTable({ sectionTitle, columns, cases, headerColor }: {
  sectionTitle: string;
  columns: string[];
  cases: CaseRecord[];
  headerColor: string;
}) {
  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className={headerColor}>
            <th className="print-cell w-6"></th>
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>{sectionTitle}</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>감지정보</th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell w-6"></th>
            <th className="print-cell w-6"></th>
            {columns.map((col, i) => (
              <th key={i} className="print-cell text-left font-semibold text-foreground whitespace-nowrap">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={11} className="print-cell text-center text-muted-foreground py-1">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** 비정상장비: with 도로명주소(읍면), sorted by district */
function DeviceTable({ cases }: { cases: CaseRecord[] }) {
  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className="bg-info/10">
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>비정상장비</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={3}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>이상정보</th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell text-left font-semibold w-6">비</th>
            <th className="print-cell text-left font-semibold">장비이상</th>
            <th className="print-cell text-left font-semibold">대상자명</th>
            <th className="print-cell text-left font-semibold">생년월일</th>
            <th className="print-cell text-left font-semibold">도로명주소</th>
            <th className="print-cell text-left font-semibold">핸드폰번호</th>
            <th className="print-cell text-left font-semibold">G/W번호</th>
            <th className="print-cell text-left font-semibold">차수</th>
            <th className="print-cell text-left font-semibold">G/W AS</th>
            <th className="print-cell text-left font-semibold">시작시각</th>
            <th className="print-cell text-left font-semibold">지속시간</th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={11} className="print-cell text-center text-muted-foreground py-1">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
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
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
