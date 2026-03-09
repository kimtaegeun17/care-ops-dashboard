import * as XLSX from 'xlsx';
import type { FileType, CaseRecord, Person, StatusCategory, DeviceTag, DailyData } from '@/types/schema';
import { v4Lite } from './utils-id';

// Detect file type from filename
export function detectFileType(fileName: string): FileType | null {
  const name = fileName;
  const patterns: [RegExp | string, FileType][] = [
    [/활동현황목록.*활동미감지/i, '활동미감지'],
    [/활동현황목록.*외출중/i, '외출중'],
    [/활동현황목록.*장기부재/i, '장기부재자'],
    [/게이트웨이.*전원차단/i, '게이트웨이_전원차단'],
    [/게이트웨이.*미수신/i, '게이트웨이_미수신'],
    [/활동감지센서1.*통신차단/i, '활동감지센서1_통신차단'],
    [/활동감지센서2.*통신차단/i, '활동감지센서2_통신차단'],
    [/화재.*통신차단/i, '화재감지센서_통신차단'],
    [/출입문.*통신차단/i, '출입문_통신차단'],
    [/호출기.*통신차단/i, '호출기_통신차단'],
    [/레이더.*전원차단/i, '레이더센서_전원차단'],
    [/레이더.*통신차단/i, '레이더센서_통신차단'],
    ['활동미감지', '활동미감지'],
    ['외출중', '외출중'],
    ['장기부재', '장기부재자'],
  ];
  for (const [pattern, type] of patterns) {
    if (pattern instanceof RegExp) {
      if (pattern.test(name)) return type;
    } else {
      if (name.includes(pattern)) return type;
    }
  }
  return null;
}

// Map file type to category and device tag
function fileTypeToCategory(ft: FileType): { category: StatusCategory; tag?: DeviceTag } {
  const map: Record<FileType, { category: StatusCategory; tag?: DeviceTag }> = {
    '활동미감지': { category: '활동미감지' },
    '외출중': { category: '장기외출' },
    '장기부재자': { category: '장기부재' },
    '게이트웨이_전원차단': { category: '비정상장비', tag: '게이트웨이 전원차단' },
    '게이트웨이_미수신': { category: '비정상장비', tag: '게이트웨이 미수신' },
    '활동감지센서1_통신차단': { category: '비정상장비', tag: '활동센서1 불량' },
    '활동감지센서2_통신차단': { category: '비정상장비', tag: '활동센서2 불량' },
    '화재감지센서_통신차단': { category: '비정상장비', tag: '화재센서 불량' },
    '출입문_통신차단': { category: '비정상장비', tag: '출입문센서 불량' },
    '호출기_통신차단': { category: '비정상장비', tag: '호출기센서 불량' },
    '레이더센서_전원차단': { category: '비정상장비', tag: '레이더센서 불량' },
    '레이더센서_통신차단': { category: '비정상장비', tag: '레이더센서 불량' },
  };
  return map[ft];
}

// Parse Excel file - handle merged multi-row headers
export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  let headerRow = -1;
  let dataStartRow = -1;

  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const val = cellA?.v?.toString()?.trim();
    if (val === '번호') headerRow = r;
    if (val === '1' && headerRow >= 0) { dataStartRow = r; break; }
  }

  const colNames: string[] = [];
  if (headerRow >= 0) {
    const subHeaderRow = headerRow + 1;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const mainCell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
      const subCell = sheet[XLSX.utils.encode_cell({ r: subHeaderRow, c })];
      const mainVal = mainCell?.v?.toString()?.trim() || '';
      const subVal = subCell?.v?.toString()?.trim() || '';
      colNames.push(subVal || mainVal || `col_${c}`);
    }
  }

  if (dataStartRow >= 0 && colNames.length > 0) {
    const rows: Record<string, string>[] = [];
    for (let r = dataStartRow; r <= range.e.r; r++) {
      const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
      const val = cellA?.v?.toString()?.trim();
      if (!val || isNaN(Number(val))) continue;
      const row: Record<string, string> = {};
      for (let c = 0; c <= range.e.c && c < colNames.length; c++) {
        const cell = sheet[XLSX.utils.encode_cell({ r, c })];
        row[colNames[c]] = cell?.v?.toString()?.trim() || '';
      }
      rows.push(row);
    }
    return rows;
  }
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
}

function findCol(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of candidates) {
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  for (const candidate of candidates) {
    for (const [k, v] of Object.entries(row)) {
      if (k.includes(candidate) && v) return v;
    }
  }
  return '';
}

function cleanAddress(addr: string): string {
  if (!addr) return '';
  const idx = addr.indexOf('경기도', 5);
  if (idx > 0 && idx < addr.length - 10) return addr.substring(0, idx);
  const half = Math.floor(addr.length / 2);
  if (addr.length > 20 && addr.substring(0, half) === addr.substring(half)) return addr.substring(0, half);
  return addr;
}

function parseElapsedToMinutes(str: string): number {
  if (!str) return 0;
  let total = 0;
  const dayMatch = str.match(/(\d+)\s*일/);
  const hourMatch = str.match(/(\d+)\s*시간/);
  const minMatch = str.match(/(\d+)\s*분/);
  if (dayMatch) total += parseInt(dayMatch[1]) * 1440;
  if (hourMatch) total += parseInt(hourMatch[1]) * 60;
  if (minMatch) total += parseInt(minMatch[1]);
  return total;
}

// Process files and merge into DailyData by category
export function processFiles(
  rows: Record<string, string>[],
  fileType: FileType,
  existingData: DailyData
): DailyData {
  const { category, tag } = fileTypeToCategory(fileType);

  for (const row of rows) {
    const name = findCol(row, '대상자명', '대상자', '이름');
    if (!name) continue;

    let detectedTime = '';
    let durationStr = '';
    let gwAs = '';

    switch (fileType) {
      case '활동미감지':
        detectedTime = findCol(row, '활동미감지\n시작시각', '활동미감지시작시각', '시작시각');
        durationStr = findCol(row, '활동미감지\n지속시간', '활동미감지지속시간', '지속시간');
        gwAs = findCol(row, 'G/W AS');
        break;
      case '외출중':
        detectedTime = findCol(row, '외출\n시작시각', '외출시작시각', '시작시각');
        durationStr = findCol(row, '외출\n지속시간', '외출지속시간', '지속시간');
        break;
      case '장기부재자':
        detectedTime = findCol(row, '장기부재\n시작일', '장기부재시작일', '시작일');
        durationStr = findCol(row, '장기부재\n지속기간', '장기부재지속기간', '지속기간');
        break;
      case '게이트웨이_전원차단':
        detectedTime = findCol(row, '전원차단\n시작시각', '전원차단시작시각', '시작시각');
        durationStr = findCol(row, '전원차단\n지속시간', '전원차단지속시간', '지속시간');
        gwAs = findCol(row, 'G/W AS');
        break;
      case '레이더센서_전원차단':
        detectedTime = findCol(row, '레이더센서(호흡)\n전원상태 수신시간', '수신시간');
        durationStr = findCol(row, '미수신시각');
        break;
      default:
        break;
    }

    const person: Person = {
      id: v4Lite(),
      name,
      birthDate: findCol(row, '출생년도', '생년월일', '생년'),
      phone: findCol(row, '핸드폰번호', '전화번호'),
      homePhone: findCol(row, '집전화번호'),
      address: cleanAddress(findCol(row, '도로명주소', '주소') || findCol(row, '지번주소')),
      region: '',
      staff: '',
      gwNumber: findCol(row, '게이트웨이번호', 'G/W번호'),
      order: findCol(row, '차수'),
    };

    const record: CaseRecord = {
      id: v4Lite(),
      person,
      category,
      deviceTag: tag,
      detectedTime,
      elapsedTime: durationStr,
      elapsedMinutes: parseElapsedToMinutes(durationStr),
      gwAs: gwAs && gwAs.includes('AS') ? gwAs : undefined,
      actionMethod: '',
      result: '',
      note: '',
    };

    // Add to appropriate category, checking for duplicates
    const targetList = category === '활동미감지' ? existingData.activityMissing
      : category === '장기외출' ? existingData.longOuting
      : category === '장기부재' ? existingData.longAbsence
      : existingData.abnormalDevice;

    const existingIdx = targetList.findIndex(r => r.person.name === name && r.person.birthDate === person.birthDate);
    if (existingIdx >= 0) {
      // Update existing with longer duration / earlier time
      const existing = targetList[existingIdx];
      if (record.elapsedMinutes > existing.elapsedMinutes) {
        existing.elapsedTime = record.elapsedTime;
        existing.elapsedMinutes = record.elapsedMinutes;
      }
      if (!existing.detectedTime || (record.detectedTime && record.detectedTime < existing.detectedTime)) {
        existing.detectedTime = record.detectedTime;
      }
      if (record.gwAs) existing.gwAs = record.gwAs;
    } else {
      targetList.push(record);
    }
  }

  existingData.lastUpdated = new Date().toISOString();
  return existingData;
}

// Create empty daily data
export function createEmptyDailyData(): DailyData {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    lastUpdated: new Date().toISOString(),
    activityMissing: [],
    longOuting: [],
    longAbsence: [],
    abnormalDevice: [],
    asRecords: [],
  };
}

// Storage key for today's data
const STORAGE_KEY = 'dailyCheckData';

export function loadDailyData(): DailyData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored) as DailyData;
      const today = new Date().toISOString().slice(0, 10);
      // Reset if it's a different day
      if (data.date !== today) {
        return createEmptyDailyData();
      }
      return data;
    }
  } catch {
    // Ignore parse errors
  }
  return createEmptyDailyData();
}

export function saveDailyData(data: DailyData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function resetDailyData(): DailyData {
  const empty = createEmptyDailyData();
  localStorage.removeItem(STORAGE_KEY);
  return empty;
}
