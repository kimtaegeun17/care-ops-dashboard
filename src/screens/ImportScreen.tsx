import { useCallback, useState } from 'react';
import { useAppState } from '@/context/AppContext';
import { detectFileType, parseExcelFile, processFiles, createEmptyDailyData } from '@/lib/importEngine';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import type { DailyData } from '@/types/schema';

interface FileEntry {
  file: File;
  detectedType: string | null;
  status: 'pending' | 'success' | 'error';
  rowCount?: number;
}

export default function ImportScreen() {
  const { setDailyData, setScreen, dailyData } = useAppState();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith('.xls') || f.name.endsWith('.xlsx')
    );
    setFiles(prev => [
      ...prev,
      ...dropped.map(file => ({
        file,
        detectedType: detectFileType(file.name),
        status: 'pending' as const,
      })),
    ]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    setFiles(prev => [
      ...prev,
      ...selected.map(file => ({
        file,
        detectedType: detectFileType(file.name),
        status: 'pending' as const,
      })),
    ]);
  }, []);

  const handleImport = async () => {
    setImporting(true);
    let newData: DailyData = { ...dailyData };

    const updated = [...files];
    for (let i = 0; i < updated.length; i++) {
      const entry = updated[i];
      if (!entry.detectedType) { entry.status = 'error'; continue; }
      try {
        const rows = await parseExcelFile(entry.file);
        newData = processFiles(rows, entry.detectedType as any, newData);
        entry.status = 'success';
        entry.rowCount = rows.length;
      } catch {
        entry.status = 'error';
      }
    }
    setFiles([...updated]);
    setDailyData(newData);
    setImporting(false);
    setDone(true);
  };

  return (
    <div className="p-6 animate-fade-in">
      <h2 className="text-xl font-bold text-foreground mb-2">파일 가져오기</h2>
      <p className="text-sm text-muted-foreground mb-6">디지털돌봄시스템에서 다운로드한 .xls/.xlsx 파일을 끌어다 놓으세요.</p>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        className="border-2 border-dashed border-primary/30 rounded-xl p-10 text-center hover:border-primary/60 transition-colors cursor-pointer bg-primary/5"
      >
        <Upload className="w-10 h-10 mx-auto text-primary/50 mb-3" />
        <p className="text-sm font-medium text-foreground mb-1">파일을 여기에 끌어다 놓으세요</p>
        <p className="text-xs text-muted-foreground mb-3">.xls, .xlsx 파일 지원</p>
        <label className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium cursor-pointer hover:opacity-90">
          파일 선택
          <input type="file" multiple accept=".xls,.xlsx" onChange={handleFileInput} className="hidden" />
        </label>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6 bg-card rounded-lg border border-border">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">파일 목록 ({files.length}개)</h3>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-auto">
            {files.map((f, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3">
                <FileSpreadsheet className="w-4 h-4 text-success flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {f.detectedType ? `→ ${f.detectedType}` : '⚠️ 파일 유형 인식 실패'}
                    {f.rowCount !== undefined && ` (${f.rowCount}행)`}
                  </p>
                </div>
                {f.status === 'success' && <CheckCircle className="w-4 h-4 text-success" />}
                {f.status === 'error' && <AlertCircle className="w-4 h-4 text-danger" />}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border flex gap-3">
            <button
              onClick={handleImport}
              disabled={importing || done}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"
            >
              {importing ? '가져오는 중...' : done ? '가져오기 완료' : '가져오기 시작'}
            </button>
            {done && (
              <button
                onClick={() => setScreen('dashboard')}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:opacity-90"
              >
                대시보드 보기 →
              </button>
            )}
            <button
              onClick={() => { setFiles([]); setDone(false); }}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:opacity-90"
            >
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
