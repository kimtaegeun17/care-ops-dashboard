import * as XLSX from 'xlsx';
import type { FileType, CaseRecord, Person, StatusCategory, DeviceTag } from '@/types/schema';
import { calculatePriority } from './priorityEngine';
import { v4Lite } from './utils-id';

// Detect file type from filename
export function detectFileType(fileName: string): FileType | null {
  const name = fileName;
  // Order matters - more specific patterns first
  const patterns: [RegExp | string, FileType][] = [
    [/활동현황목록.*활동미감지/i, '활동미감지'],
    [/활동현황목록.*외출중/i, '외출중'],
    [/활동현황목록.*장기부재/i, '장기부재자'],
    [/게이트웨이.*전원차단/i, '게이트웨이_전원차단'],
    [/게이트웨이.*미수신/i, '게이트웨이_미수신'],
    [/활동감지센서1.*통신차단/i, '활동감지센서1_통신차단'],
    [/활동감지센서2.*통신차단/i, '활동감지센서2_통신차단'],
    [/활동1.*통신차단/i, '활동감지센서1_통신차단'],
    [/활동2.*통신차단/i, '활동감지센서2_통신차단'],
    [/화재.*통신차단/i, '화재감지센서_통신차단'],
    [/출입문.*통신차단/i, '출입문_통신차단'],
    [/호출기.*통신차단/i, '호출기_통신차단'],
    [/레이더.*전원차단/i, '레이더센서_전원차단'],
    [/레이더.*통신차단/i, '레이더센서_통신차단'],
    // Fallback simple patterns
    ['활동미감지', '활동미감지'],
    ['외출중', '외출중'],
    ['장기부재', '장기부재자'],
    ['게이트웨이_전원차단', '게이트웨이_전원차단'],
    ['게이트웨이전원차단', '게이트웨이_전원차단'],
    ['게이트웨이_미수신', '게이트웨이_미수신'],
    ['게이트웨이미수신', '게이트웨이_미수신'],
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

// Map file type to status and device tag
function fileTypeToStatusAndTag(ft: FileType): { status: StatusCategory; tag?: DeviceTag } {
  const map: Record<FileType, { status: StatusCategory; tag?: DeviceTag }> = {
    '활동미감지': { status: '활동미감지' },
    '외출중': { status: '장기외출' },
    '장기부재자': { status: '장기부재' },
    '게이트웨이_전원차단': { status: '비정상장비', tag: '게이트웨이 전원차단' },
    '게이트웨이_미수신': { status: '비정상장비', tag: '게이트웨이 미수신' },
    '활동감지센서1_통신차단': { status: '비정상장비', tag: '활동센서1 연결불량' },
    '활동감지센서2_통신차단': { status: '비정상장비', tag: '활동센서2 통신불량' },
    '화재감지센서_통신차단': { status: '비정상장비', tag: '화재감지센서 통신불량' },
    '출입문_통신차단': { status: '비정상장비', tag: '출입문감지센서 통신불량' },
    '호출기_통신차단': { status: '비정상장비', tag: '호출기 통신불량' },
    '레이더센서_전원차단': { status: '비정상장비', tag: '레이더 전원차단' },
    '레이더센서_통신차단': { status: '비정상장비', tag: '레이더 통신불량' },
  };
  return map[ft];
}

// Parse Excel file - handle merged multi-row headers from the digital care system
export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];

  // Try to find actual data start row by looking for '1' in column A
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  let headerRow = -1;
  let dataStartRow = -1;

  // Scan for the row that has '번호' or numeric 1 in first column
  for (let r = range.s.r; r <= Math.min(range.e.r, 10); r++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
    const val = cellA?.v?.toString()?.trim();
    if (val === '번호') {
      headerRow = r;
    }
    if (val === '1' && headerRow >= 0) {
      dataStartRow = r;
      break;
    }
  }

  // Build column mapping from the header rows
  // The digital care system uses 2-row merged headers
  const colNames: string[] = [];
  if (headerRow >= 0) {
    // Collect names from header row and the row below it (sub-headers)
    const subHeaderRow = headerRow + 1;
    for (let c = range.s.c; c <= range.e.c; c++) {
      const mainCell = sheet[XLSX.utils.encode_cell({ r: headerRow, c })];
      const subCell = sheet[XLSX.utils.encode_cell({ r: subHeaderRow, c })];
      const mainVal = mainCell?.v?.toString()?.trim() || '';
      const subVal = subCell?.v?.toString()?.trim() || '';
      // Use sub-header if available, otherwise main header
      colNames.push(subVal || mainVal || `col_${c}`);
    }
  }

  // If we found proper structure, manually extract rows
  if (dataStartRow >= 0 && colNames.length > 0) {
    const rows: Record<string, string>[] = [];
    for (let r = dataStartRow; r <= range.e.r; r++) {
      const cellA = sheet[XLSX.utils.encode_cell({ r, c: 0 })];
      const val = cellA?.v?.toString()?.trim();
      // Skip empty rows or non-data rows
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

  // Fallback: use standard json parsing
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
}

// Find a value from a row by trying multiple possible column names
function findCol(row: Record<string, string>, ...candidates: string[]): string {
  for (const key of candidates) {
    // Exact match
    if (row[key] !== undefined && row[key] !== '') return row[key];
  }
  // Fuzzy match: find any key containing the candidate
  for (const candidate of candidates) {
    for (const [k, v] of Object.entries(row)) {
      if (k.includes(candidate) && v) return v;
    }
  }
  return '';
}

// Merge parsed rows into case records, deduplicating by person name + birth year
export function mergeIntoCases(
  existingCases: Map<string, CaseRecord>,
  rows: Record<string, string>[],
  fileType: FileType,
  snapshotId: string,
): Map<string, CaseRecord> {
  const { status, tag } = fileTypeToStatusAndTag(fileType);

  for (const row of rows) {
    const name = findCol(row, '대상자명', '대상자', '이름');
    const birth = findCol(row, '출생년도', '생년월일', '생년');
    if (!name) continue;

    const key = `${name}_${birth}`;

    // Extract time/duration based on file type
    let detectedTime = '';
    let durationStr = '';
    let gwAs = '';

    switch (fileType) {
      case '활동미감지':
        detectedTime = findCol(row, '활동미감지\n시작시각', '활동미감지시작시각', '시작시각', '활동미감지');
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
        detectedTime = findCol(row, '레이더센서(호흡)\n전원상태 수신시간', '전원상태 수신시간', '수신시간');
        durationStr = findCol(row, '레이더센서(호흡)\n전원상태\n미수신시각', '미수신시각');
        break;
      default:
        // 통신차단 files (활동감지센서1/2, 출입문, 호출기, 화재감지, 레이더통신) - no time columns
        break;
    }

    const minutes = parseElapsedToMinutes(durationStr);

    const existing = existingCases.get(key);
    if (existing) {
      // Merge: add status and tag
      if (!existing.statuses.includes(status)) existing.statuses.push(status);
      if (tag && !existing.deviceTags.includes(tag)) existing.deviceTags.push(tag);
      existing.detailText = buildDetailText(existing.statuses, existing.deviceTags);
      // Keep earliest detection time
      if (detectedTime && (!existing.firstDetected || detectedTime < existing.firstDetected)) {
        existing.firstDetected = detectedTime;
      }
      // Keep longest elapsed
      if (minutes > existing.elapsedMinutes) {
        existing.elapsedMinutes = minutes;
        existing.elapsedTime = durationStr || calcElapsed(minutes);
      }
      // Update A/S status
      if (gwAs && gwAs.includes('AS')) {
        existing.asStatus = gwAs;
      }
      // Recalculate priority
      const p = calculatePriority(existing.statuses, existing.deviceTags, existing.elapsedMinutes);
      existing.priority = p.level;
      existing.priorityScore = p.score;
      // Update absence days
      if (status === '장기부재') {
        existing.absenceDays = Math.max(existing.absenceDays || 0, Math.floor(minutes / 1440));
      }
    } else {
      const phone = findCol(row, '핸드폰번호', '전화번호', '연락처');
      const homePhone = findCol(row, '집전화번호');
      const address = findCol(row, '도로명주소', '주소') || findCol(row, '지번주소');
      const gwNumber = findCol(row, '게이트웨이번호', 'G/W번호', 'GW번호');
      const order = findCol(row, '차수');

      const person: Person = {
        id: v4Lite(),
        name,
        birthDate: birth,
        phone: phone || homePhone,
        address: cleanAddress(address),
        region: '',  // Will be assigned later or manually
        staff: '',   // Will be assigned later
        gwNumber,
      };

      const statuses: StatusCategory[] = [status];
      const deviceTags: DeviceTag[] = tag ? [tag] : [];
      const p = calculatePriority(statuses, deviceTags, minutes);

      const record: CaseRecord = {
        id: v4Lite(),
        snapshotId,
        person,
        statuses,
        deviceTags,
        detailText: buildDetailText(statuses, deviceTags),
        firstDetected: detectedTime,
        elapsedTime: durationStr || calcElapsed(minutes),
        elapsedMinutes: minutes,
        priority: p.level,
        priorityScore: p.score,
        actionMethod: '',
        result: '',
        note: '',
        asStatus: gwAs && gwAs.includes('AS') ? gwAs : undefined,
        absenceDays: status === '장기부재' ? Math.floor(minutes / 1440) : undefined,
        isNew: true,
      };
      existingCases.set(key, record);
    }
  }
  return existingCases;
}

function buildDetailText(statuses: StatusCategory[], tags: DeviceTag[]): string {
  const parts: string[] = [];
  if (statuses.includes('활동미감지')) parts.push('활동미감지');
  if (statuses.includes('장기외출')) parts.push('장기외출');
  if (statuses.includes('장기부재')) parts.push('장기부재');
  if (tags.length > 0) parts.push(...tags);
  return parts.join(', ');
}

function cleanAddress(addr: string): string {
  if (!addr) return '';
  // The digital care system often duplicates address parts
  // e.g. "경기도 양평군 지평면 곡수시장길 13-2경기도 양평군 지평면 곡수시장길 13-2"
  const half = Math.floor(addr.length / 2);
  if (addr.length > 20 && addr.substring(0, half) === addr.substring(half)) {
    return addr.substring(0, half);
  }
  // Check if second half starts with 경기도
  const idx = addr.indexOf('경기도', 5);
  if (idx > 0 && idx < addr.length - 10) {
    return addr.substring(0, idx);
  }
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
  if (total === 0) {
    const num = parseInt(str);
    if (!isNaN(num)) total = num;
  }
  return total;
}

function calcElapsed(minutes: number): string {
  if (minutes <= 0) return '-';
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return `${h}시간${m > 0 ? ` ${m}분` : ''}`;
  const d = Math.floor(h / 24);
  return `${d}일 ${h % 24}시간`;
}
