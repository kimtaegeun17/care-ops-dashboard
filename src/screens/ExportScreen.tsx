import { useAppState } from '@/context/AppContext';
import { exportToExcel, printTable } from '@/lib/exportEngine';
import { Printer, FileSpreadsheet } from 'lucide-react';

export default function ExportScreen() {
  const { filtered } = useAppState();
  const today = new Date();
  const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

  const allCases = [
    ...filtered.activityMissing,
    ...filtered.longOuting,
    ...filtered.longAbsence,
    ...filtered.abnormalDevice,
  ];

  const exports = [
    { label: '전체 일일점검현황', desc: '모든 대상자', data: allCases, filename: `일일점검현황_${dateStr}` },
    { label: '활동미감지', desc: '6시간 이상', data: filtered.activityMissing, filename: `활동미감지_${dateStr}` },
    { label: '장기외출', desc: '6시간 이상', data: filtered.longOuting, filename: `장기외출_${dateStr}` },
    { label: '장기부재', desc: '장기부재 대상자', data: filtered.longAbsence, filename: `장기부재_${dateStr}` },
    { label: '비정상장비', desc: '장비 이상', data: filtered.abnormalDevice, filename: `비정상장비_${dateStr}` },
  ];

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">인쇄 / 내보내기</h2>
      <p className="text-sm text-muted-foreground mb-6">{dateStr} 기준 데이터</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {exports.map(exp => (
          <div key={exp.label} className="bg-card rounded-lg border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-1">{exp.label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{exp.desc} ({exp.data.length}건)</p>
            <div className="flex gap-2">
              <button
                onClick={() => exportToExcel(exp.data, exp.filename)}
                className="flex items-center gap-1.5 px-3 py-2 bg-success text-success-foreground rounded-lg text-xs font-medium hover:opacity-90"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
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
