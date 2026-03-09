import { useAppState } from '@/context/AppContext';
import { Clock, FileSpreadsheet } from 'lucide-react';

export default function SnapshotScreen() {
  const { snapshots } = useAppState();

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">스냅샷 이력</h2>
      <p className="text-sm text-muted-foreground mb-6">날짜/시간별 데이터 스냅샷 이력</p>

      <div className="space-y-3">
        {snapshots.map(snap => (
          <div key={snap.id} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {snap.date} {snap.time} ({snap.period})
                  </p>
                  <p className="text-xs text-muted-foreground">{snap.caseCount}건 기록</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-semibold ${
                snap.period === 'AM' ? 'bg-info/15 text-info' : 'bg-warning/15 text-warning'
              }`}>
                {snap.period}
              </span>
            </div>
            {snap.importedFiles.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {snap.importedFiles.map(f => (
                  <span key={f.id} className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-[10px] text-muted-foreground">
                    <FileSpreadsheet className="w-3 h-3" /> {f.fileType} ({f.rowCount}행)
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
