import { useAppState } from '@/context/AppContext';
import { exportToExcel, printTable } from '@/lib/exportEngine';
import { Printer, FileDown, FileSpreadsheet } from 'lucide-react';

export default function ExportScreen() {
  const { cases, currentSnapshot } = useAppState();
  const dateStr = currentSnapshot?.date || new Date().toISOString().slice(0, 10);

  const exports = [
    {
      label: '전체 일일점검현황',
      desc: '전체 대상자 점검 현황표',
      data: cases,
      filename: `일일점검현황_${dateStr}`,
    },
    {
      label: '비정상장비 관리표',
      desc: '비정상장비 대상자만 필터',
      data: cases.filter(c => c.statuses.includes('비정상장비')),
      filename: `비정상장비관리표_${dateStr}`,
    },
    {
      label: '장기부재 관리표',
      desc: '장기부재/장기외출 대상자',
      data: cases.filter(c => c.statuses.includes('장기부재') || c.statuses.includes('장기외출')),
      filename: `장기부재관리표_${dateStr}`,
    },
    {
      label: '긴급 대상자 목록',
      desc: '긴급/높음 우선순위만',
      data: cases.filter(c => c.priority === 'critical' || c.priority === 'high'),
      filename: `긴급대상자_${dateStr}`,
    },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">인쇄 / 내보내기</h2>
      <p className="text-sm text-muted-foreground mb-6">{dateStr} 기준 데이터</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {exports.map(exp => (
          <div key={exp.label} className="bg-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-bold text-foreground mb-1">{exp.label}</h3>
            <p className="text-xs text-muted-foreground mb-4">{exp.desc} ({exp.data.length}건)</p>
            <div className="flex gap-2">
              <button
                onClick={() => exportToExcel(exp.data, exp.filename)}
                className="flex items-center gap-1.5 px-3 py-2 bg-success text-success-foreground rounded-lg text-xs font-medium hover:opacity-90"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel 다운로드
              </button>
              <button
                onClick={printTable}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-medium hover:opacity-90"
              >
                <Printer className="w-3.5 h-3.5" /> 인쇄
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
