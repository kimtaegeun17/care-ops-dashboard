import * as XLSX from 'xlsx';
import type { FileType, CaseRecord, Person, StatusCategory, DeviceTag } from '@/types/schema';
import { calculatePriority } from './priorityEngine';
import { v4Lite } from './utils-id';

// Detect file type from filename
export function detectFileType(fileName: string): FileType | null {
  const lower = fileName.toLowerCase();
  const map: [string, FileType][] = [
    ['활동미감지', '활동미감지'],
    ['외출중', '외출중'],
    ['장기부재', '장기부재자'],
    ['게이트웨이_전원차단', '게이트웨이_전원차단'],
    ['게이트웨이전원차단', '게이트웨이_전원차단'],
    ['게이트웨이_미수신', '게이트웨이_미수신'],
    ['게이트웨이미수신', '게이트웨이_미수신'],
    ['활동감지센서1', '활동감지센서1_통신차단'],
    ['활동1', '활동감지센서1_통신차단'],
    ['활동감지센서2', '활동감지센서2_통신차단'],
    ['활동2', '활동감지센서2_통신차단'],
    ['화재감지', '화재감지센서_통신차단'],
    ['화재', '화재감지센서_통신차단'],
    ['출입문', '출입문_통신차단'],
    ['호출기', '호출기_통신차단'],
    ['레이더센서_전원차단', '레이더센서_전원차단'],
    ['레이더센서전원차단', '레이더센서_전원차단'],
    ['레이더센서_통신차단', '레이더센서_통신차단'],
    ['레이더센서통신차단', '레이더센서_통신차단'],
    ['레이더_전원', '레이더센서_전원차단'],
    ['레이더_통신', '레이더센서_통신차단'],
  ];
  for (const [pattern, type] of map) {
    if (lower.includes(pattern)) return type;
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

// Parse Excel file into raw rows
export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
  const data = await file.arrayBuffer();
  const wb = XLSX.read(data, { type: 'array' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' });
}

// Merge parsed rows into case records, deduplicating by person name + birthdate
export function mergeIntoCases(
  existingCases: Map<string, CaseRecord>,
  rows: Record<string, string>[],
  fileType: FileType,
  snapshotId: string,
): Map<string, CaseRecord> {
  const { status, tag } = fileTypeToStatusAndTag(fileType);

  for (const row of rows) {
    const name = row['대상자명'] || row['대상자'] || row['이름'] || '';
    const birth = row['생년월일'] || row['생년'] || '';
    const key = `${name}_${birth}`;
    if (!name) continue;

    const existing = existingCases.get(key);
    if (existing) {
      if (!existing.statuses.includes(status)) existing.statuses.push(status);
      if (tag && !existing.deviceTags.includes(tag)) existing.deviceTags.push(tag);
      // Update detail
      existing.detailText = [...existing.statuses, ...existing.deviceTags].join(', ');
      // Recalculate priority
      const p = calculatePriority(existing.statuses, existing.deviceTags, existing.elapsedMinutes);
      existing.priority = p.level;
      existing.priorityScore = p.score;
    } else {
      const elapsedStr = row['경과시간'] || row['활동미감지시간'] || '';
      const minutes = parseElapsedToMinutes(elapsedStr);
      const person: Person = {
        id: v4Lite(),
        name,
        birthDate: birth,
        phone: row['연락처'] || row['전화번호'] || row['심전화번호'] || '',
        address: row['주소'] || row['거주주소'] || row['도로명주소'] || '',
        region: row['권역'] || row['지역센터'] || '',
        staff: row['담당자'] || '',
        gwNumber: row['G/W번호'] || row['GW번호'] || '',
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
        detailText: [status, ...(tag ? [tag] : [])].join(', '),
        firstDetected: row['최초감지시각'] || row['활동미감지시각'] || row['최종활동시각'] || '',
        elapsedTime: elapsedStr || calcElapsed(minutes),
        elapsedMinutes: minutes,
        priority: p.level,
        priorityScore: p.score,
        actionMethod: '',
        result: '',
        note: '',
        absenceDays: status === '장기부재' ? Math.floor(minutes / 1440) : undefined,
        isNew: true,
      };
      existingCases.set(key, record);
    }
  }
  return existingCases;
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
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return `${h}시간 ${m}분`;
  const d = Math.floor(h / 24);
  return `${d}일 ${h % 24}시간`;
}
