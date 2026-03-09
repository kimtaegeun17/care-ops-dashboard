import * as XLSX from 'xlsx';
import type { CaseRecord } from '@/types/schema';

interface ExportRow {
  순번: number;
  대상자명: string;
  출생년도: string;
  도로명주소: string;
  핸드폰번호: string;
  게이트웨이번호: string;
  차수: string;
  장비이상?: string;
  시작시각: string;
  지속시간: string;
  조치방법: string;
  결과: string;
  비고: string;
}

export function casesToExportRows(cases: CaseRecord[]): ExportRow[] {
  return cases.map((c, i) => ({
    순번: i + 1,
    대상자명: c.person.name,
    출생년도: c.person.birthDate,
    도로명주소: c.person.address,
    핸드폰번호: c.person.phone,
    게이트웨이번호: c.person.gwNumber || '',
    차수: c.person.order || '',
    장비이상: c.deviceTag || '',
    시작시각: c.detectedTime,
    지속시간: c.elapsedTime,
    조치방법: c.actionMethod,
    결과: c.result,
    비고: c.note,
  }));
}

export function exportToExcel(cases: CaseRecord[], filename: string) {
  const rows = casesToExportRows(cases);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '일일점검현황');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function printTable() {
  window.print();
}
