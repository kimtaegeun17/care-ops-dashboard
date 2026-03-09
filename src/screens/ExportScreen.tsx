import { useAppState } from '@/context/AppContext';
import { exportFullReport, printTable } from '@/lib/exportEngine';
import { Printer, FileSpreadsheet } from 'lucide-react';

export default function ExportScreen() {
  const { filtered, dailyData } = useAppState();
  const today = new Date();
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dateLabel = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.(${dayNames[today.getDay()]})`;

  const handleExport = () => {
    exportFullReport(
      filtered.activityMissing,
      filtered.longOuting,
      filtered.longAbsence,
      filtered.abnormalDevice,
      dailyData.asRecords,
      dateLabel
    );
  };

  return (
    <div className="p-6 animate-fade-in">
      {/* Controls - hidden when printing */}
      <div className="no-print flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">인쇄 / 내보내기</h2>
          <p className="text-sm text-muted-foreground">일일점검현황 {dateLabel}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <FileSpreadsheet className="w-4 h-4" /> Excel 내보내기
          </button>
          <button
            onClick={printTable}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Printer className="w-4 h-4" /> 인쇄
          </button>
        </div>
      </div>

      {/* Print Preview - matches the exact Excel format */}
      <div className="print-area bg-card border border-border rounded-lg overflow-hidden">
        {/* Title */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="text-base font-bold text-foreground text-center">일일점검대상자 {dateLabel}</h3>
        </div>

        {/* 활동미감지 6시간 이상 */}
        <SectionTable
          sectionTitle="활동미감지6시간이상"
          columns={['대상자명', '출생년도', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '활동미감지\n시작시각', '활동미감지\n지속시간']}
          cases={filtered.activityMissing}
          headerColor="bg-danger/10"
        />

        {/* 장기외출 */}
        <SectionTable
          sectionTitle="장기외출"
          columns={['대상자명', '출생년도', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '외출감지\n시작시각', '외출\n지속시간']}
          cases={filtered.longOuting}
          headerColor="bg-warning/10"
        />

        {/* 장기부재 */}
        <SectionTable
          sectionTitle="장기부재"
          columns={['대상자명', '생년월일', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '장기부재\n시작일', '장기부재\n지속기간']}
          cases={filtered.longAbsence}
          headerColor="bg-status-long-absence/10"
        />

        {/* 비정상장비 */}
        <DeviceTable cases={filtered.abnormalDevice} />

        {/* A/S 관리 - Page 2 */}
        {dailyData.asRecords.length > 0 && (
          <AsTable records={dailyData.asRecords} />
        )}
      </div>
    </div>
  );
}

function SectionTable({ sectionTitle, columns, cases, headerColor }: {
  sectionTitle: string;
  columns: string[];
  cases: import('@/types/schema').CaseRecord[];
  headerColor: string;
}) {
  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className={headerColor}>
            <th className="print-cell w-8"></th>
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>{sectionTitle}</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>{sectionTitle} 정보</th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell w-8"></th>
            <th className="print-cell w-8"></th>
            {columns.map((col, i) => (
              <th key={i} className="print-cell text-left font-semibold text-foreground whitespace-pre-line">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={11} className="print-cell text-center text-muted-foreground py-2">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="print-cell"></td>
                <td className="print-cell text-center">{i + 1}</td>
                <td className="print-cell font-semibold">{c.person.name}</td>
                <td className="print-cell">{c.person.birthDate}</td>
                <td className="print-cell max-w-[200px] truncate">{c.person.address}</td>
                <td className="print-cell">{c.person.phone}</td>
                <td className="print-cell">{c.person.gwNumber}</td>
                <td className="print-cell">{c.person.order}</td>
                <td className="print-cell">{c.gwAs || ''}</td>
                <td className="print-cell">{c.detectedTime}</td>
                <td className="print-cell font-medium">{c.elapsedTime}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function DeviceTable({ cases }: { cases: import('@/types/schema').CaseRecord[] }) {
  return (
    <div className="border-b border-border">
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className="bg-info/10">
            <th className="print-cell w-8"></th>
            <th className="print-cell font-bold text-foreground text-left" colSpan={2}>비정상장비</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={4}>대상자정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>장비정보</th>
            <th className="print-cell text-muted-foreground text-left" colSpan={2}>이상정보</th>
          </tr>
          <tr className="bg-muted/50">
            <th className="print-cell w-8"></th>
            <th className="print-cell w-8"></th>
            <th className="print-cell text-left font-semibold">대상자명</th>
            <th className="print-cell text-left font-semibold">생년월일</th>
            <th className="print-cell text-left font-semibold">도로명주소</th>
            <th className="print-cell text-left font-semibold">핸드폰번호</th>
            <th className="print-cell text-left font-semibold">게이트웨이번호</th>
            <th className="print-cell text-left font-semibold">차수</th>
            <th className="print-cell text-left font-semibold"></th>
            <th className="print-cell text-left font-semibold whitespace-pre-line">{'전원차단\n시작시각'}</th>
            <th className="print-cell text-left font-semibold whitespace-pre-line">{'전원차단\n지속시간'}</th>
          </tr>
        </thead>
        <tbody>
          {cases.length === 0 ? (
            <tr><td colSpan={11} className="print-cell text-center text-muted-foreground py-2">데이터 없음</td></tr>
          ) : (
            cases.map((c, i) => (
              <tr key={c.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
                <td className="print-cell text-center font-bold text-info">비</td>
                <td className="print-cell text-xs">
                  <span className="px-1 py-0.5 rounded bg-info/10 text-info font-semibold text-[10px]">{c.deviceTag}</span>
                </td>
                <td className="print-cell font-semibold">{c.person.name}</td>
                <td className="print-cell">{c.person.birthDate}</td>
                <td className="print-cell max-w-[200px] truncate">{c.person.address}</td>
                <td className="print-cell">{c.person.phone}</td>
                <td className="print-cell">{c.person.gwNumber}</td>
                <td className="print-cell">{c.person.order}</td>
                <td className="print-cell"></td>
                <td className="print-cell">{c.detectedTime}</td>
                <td className="print-cell font-medium">{c.elapsedTime}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AsTable({ records }: { records: import('@/types/schema').AsRecord[] }) {
  return (
    <div className="mt-4 border-t-2 border-border">
      <div className="px-4 py-2 bg-muted/30 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">A/S 관리</h3>
      </div>
      <table className="w-full text-xs border-collapse print-table">
        <thead>
          <tr className="bg-muted/50">
            {['차수', '면', '대상자', '생년월일', 'G/W번호', '장비명', '세부사항', 'as입고일자', '택배발송&요청일자', '설치완료일자', '설치비고', '보급완료갯수확인'].map(h => (
              <th key={h} className="print-cell text-left font-semibold text-foreground">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((r, i) => (
            <tr key={r.id} className={i % 2 === 0 ? '' : 'bg-muted/20'}>
              <td className="print-cell">{r.order}</td>
              <td className="print-cell">{r.region}</td>
              <td className="print-cell font-semibold">{r.name}</td>
              <td className="print-cell">{r.birthDate}</td>
              <td className="print-cell">{r.gwNumber}</td>
              <td className="print-cell">{r.deviceName}</td>
              <td className="print-cell max-w-[250px]">{r.detail}</td>
              <td className="print-cell">{r.asReceiveDate}</td>
              <td className="print-cell">{r.deliveryRequestDate}</td>
              <td className="print-cell">{r.installCompleteDate}</td>
              <td className="print-cell">{r.installNote}</td>
              <td className="print-cell">{r.supplyCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
