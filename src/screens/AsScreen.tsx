import { useState } from 'react';
import { useAppState } from '@/context/AppContext';
import type { AsRecord } from '@/types/schema';
import { v4Lite } from '@/lib/utils-id';
import { Plus, Trash2 } from 'lucide-react';

export default function AsScreen() {
  const { dailyData, addAsRecord, updateAsRecord, deleteAsRecord } = useAppState();
  const records = dailyData.asRecords;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<AsRecord>>({});

  const handleAdd = () => {
    const newRecord: AsRecord = {
      id: v4Lite(),
      order: form.order || '',
      region: form.region || '',
      name: form.name || '',
      birthDate: form.birthDate || '',
      gwNumber: form.gwNumber || '',
      deviceName: form.deviceName || '',
      detail: form.detail || '',
      asReceiveDate: form.asReceiveDate || '',
      deliveryRequestDate: form.deliveryRequestDate || '',
      installCompleteDate: form.installCompleteDate || '',
      installNote: form.installNote || '',
      supplyCount: form.supplyCount || '',
    };
    addAsRecord(newRecord);
    setForm({});
    setShowForm(false);
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">A/S 관리</h2>
          <p className="text-sm text-muted-foreground">{records.length}건</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> 추가
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="mb-4 p-4 bg-card border border-border rounded-lg">
          <h3 className="text-sm font-bold text-foreground mb-3">A/S 항목 추가</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <input placeholder="차수" value={form.order || ''} onChange={e => setForm(p => ({ ...p, order: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="면 (용문면)" value={form.region || ''} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="대상자" value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="생년월일" value={form.birthDate || ''} onChange={e => setForm(p => ({ ...p, birthDate: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="G/W번호" value={form.gwNumber || ''} onChange={e => setForm(p => ({ ...p, gwNumber: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="장비명" value={form.deviceName || ''} onChange={e => setForm(p => ({ ...p, deviceName: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="as입고일자" value={form.asReceiveDate || ''} onChange={e => setForm(p => ({ ...p, asReceiveDate: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
            <input placeholder="택배발송일자" value={form.deliveryRequestDate || ''} onChange={e => setForm(p => ({ ...p, deliveryRequestDate: e.target.value }))} className="text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground" />
          </div>
          <input placeholder="세부사항" value={form.detail || ''} onChange={e => setForm(p => ({ ...p, detail: e.target.value }))} className="w-full text-sm px-2 py-1.5 border border-input rounded bg-background text-foreground mb-3" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium">추가</button>
            <button onClick={() => { setShowForm(false); setForm({}); }} className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded text-sm font-medium">취소</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-table-header text-table-header-foreground">
              {['차수', '면', '대상자', '생년월일', 'G/W번호', '장비명', '세부사항', 'as입고', '택배발송', '설치완료', '비고', ''].map(h => (
                <th key={h} className="px-2 py-2 text-left text-xs font-bold whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((r, i) => (
              <tr key={r.id} className={`${i % 2 === 0 ? 'bg-table-row-alt' : 'bg-card'} hover:bg-table-row-hover`}>
                <td className="px-2 py-2 text-xs">{r.order}</td>
                <td className="px-2 py-2 text-xs">{r.region}</td>
                <td className="px-2 py-2 text-xs font-semibold">{r.name}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{r.birthDate}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{r.gwNumber}</td>
                <td className="px-2 py-2 text-xs">{r.deviceName}</td>
                <td className="px-2 py-2 text-xs max-w-[200px] truncate">{r.detail}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{r.asReceiveDate}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{r.deliveryRequestDate}</td>
                <td className="px-2 py-2 text-xs text-muted-foreground">{r.installCompleteDate}</td>
                <td className="px-2 py-2 text-xs">{r.installNote}</td>
                <td className="px-2 py-2">
                  <button onClick={() => deleteAsRecord(r.id)} className="text-danger hover:opacity-70">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">데이터 없음</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
