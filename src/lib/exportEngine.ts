import * as XLSX from 'xlsx';
import type { CaseRecord, UnifiedRow } from '@/types/schema';
import { priorityLabel } from './priorityEngine';

export function casesToUnifiedRows(cases: CaseRecord[]): UnifiedRow[] {
  return cases.map((c, i) => ({
    순번: i + 1,
    권역: c.person.region,
    담당자: c.person.staff,
    대상자명: c.person.name,
    생년월일: c.person.birthDate,
    연락처: c.person.phone,
    주소: c.person.address,
    상태구분: c.statuses.join(', '),
    세부이상: c.detailText,
    최초감지시각: c.firstDetected,
    경과시간: c.elapsedTime,
    우선순위: priorityLabel(c.priority),
    조치방법: c.actionMethod,
    결과: c.result,
    비고: c.note,
  }));
}

export function exportToExcel(cases: CaseRecord[], filename: string) {
  const rows = casesToUnifiedRows(cases);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '일일점검현황');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function printTable() {
  window.print();
}
