import { CaseRecord, DashboardStats, Person, Snapshot, StaffSummary, type StatusCategory, type DeviceTag, type PriorityLevel } from '@/types/schema';

const regions = ['1권역', '2권역', '3권역'];
const staffNames = ['김영희', '이철수', '박미영', '정대호', '최수진'];

function randomPhone(): string {
  return `010-${String(Math.floor(Math.random() * 9000) + 1000)}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
}

const mockPeople: Person[] = [
  { id: 'p1', name: '최금옥', birthDate: '1950-08-15', phone: '010-5502-7798', address: '경기도 양평군 서종면 수능리 719', region: '1권역', staff: '김영희', gwNumber: 'GW-001' },
  { id: 'p2', name: '이순례', birthDate: '1944-05-01', phone: '010-8382-1958', address: '경기도 양평군 단월면 석산리 90-1', region: '1권역', staff: '김영희', gwNumber: 'GW-002' },
  { id: 'p3', name: '최귀순', birthDate: '1941-05-26', phone: '010-3798-3106', address: '경기도 양평군 옥천면 옥천리 511', region: '2권역', staff: '이철수', gwNumber: 'GW-003' },
  { id: 'p4', name: '최경원', birthDate: '1958-11-12', phone: '010-5472-5540', address: '경기도 양평군 용문면 중원리 202-2', region: '2권역', staff: '이철수', gwNumber: 'GW-004' },
  { id: 'p5', name: '박계임', birthDate: '1952-06-23', phone: '010-8473-2626', address: '경기도 양평군 용문면 연수리 493-2', region: '1권역', staff: '박미영', gwNumber: 'GW-005' },
  { id: 'p6', name: '김상기', birthDate: '1947-03-02', phone: '010-9808-3020', address: '경기도 양평군 서종면 발리 820', region: '3권역', staff: '정대호', gwNumber: 'GW-006' },
  { id: 'p7', name: '오순복', birthDate: '1938-02-28', phone: '010-9513-2700', address: '경기도 양평군 양평읍 덕곡리 172-21', region: '3권역', staff: '정대호', gwNumber: 'GW-007' },
  { id: 'p8', name: '조홍임', birthDate: '1946-04-17', phone: '010-4275-9484', address: '경기도 양평군 강하면 대석리 306-2', region: '2권역', staff: '최수진', gwNumber: 'GW-008' },
  { id: 'p9', name: '송순자', birthDate: '1944-06-27', phone: '010-9665-7966', address: '경기도 양평군 강상면 대석리 622-5', region: '3권역', staff: '최수진', gwNumber: 'GW-009' },
  { id: 'p10', name: '김금순', birthDate: '1944-09-13', phone: '010-6635-0248', address: '경기도 양평군 서종면 덕곡리 1027-1', region: '1권역', staff: '김영희', gwNumber: 'GW-010' },
  { id: 'p11', name: '류복순', birthDate: '1932-10-05', phone: '010-4006-6384', address: '경기도 양평군 강전면 세미리 100-2', region: '2권역', staff: '이철수' },
  { id: 'p12', name: '김학조', birthDate: '1935-09-15', phone: '010-4166-6230', address: '경기도 양평군 용문면 삼성리 378-45', region: '3권역', staff: '박미영' },
  { id: 'p13', name: '최남달', birthDate: '1949-08-10', phone: '010-7742-2426', address: '경기도 양평군 양평읍 연수리 502-1', region: '1권역', staff: '정대호' },
  { id: 'p14', name: '박태호', birthDate: '1949-02-02', phone: '010-3325-8316', address: '경기도 양평군 옥천면 243-6', region: '2권역', staff: '최수진' },
  { id: 'p15', name: '강명순', birthDate: '1940-12-20', phone: randomPhone(), address: '경기도 양평군 청운면 신론리 88-3', region: '3권역', staff: '김영희' },
];

function calcElapsed(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h < 24) return `${h}시간 ${m}분`;
  const d = Math.floor(h / 24);
  return `${d}일 ${h % 24}시간`;
}

const now = new Date();
const todayStr = now.toISOString().slice(0, 10);
const timeStr = now.toTimeString().slice(0, 5);

export const mockSnapshot: Snapshot = {
  id: 'snap-001',
  date: todayStr,
  time: timeStr,
  period: now.getHours() < 12 ? 'AM' : 'PM',
  createdAt: now.toISOString(),
  importedFiles: [
    { id: 'f1', snapshotId: 'snap-001', fileName: '활동현황목록 (활동미감지 대상자)_20260309_09.xls', fileType: '활동미감지', rowCount: 5, importedAt: now.toISOString() },
    { id: 'f2', snapshotId: 'snap-001', fileName: '장비개통정보 (게이트웨이전원차단)_20260309.xls', fileType: '게이트웨이_전원차단', rowCount: 3, importedAt: now.toISOString() },
    { id: 'f3', snapshotId: 'snap-001', fileName: '장비개통정보 (활동감지센서1통신차단)_20260309.xls', fileType: '활동감지센서1_통신차단', rowCount: 2, importedAt: now.toISOString() },
    { id: 'f4', snapshotId: 'snap-001', fileName: '장기부재자목록_20260309.xls', fileType: '장기부재자', rowCount: 3, importedAt: now.toISOString() },
  ],
  caseCount: 15,
};

const statusConfigs: { person: Person; statuses: StatusCategory[]; tags: DeviceTag[]; minutes: number; detail: string; isNew?: boolean }[] = [
  { person: mockPeople[0], statuses: ['활동미감지', '비정상장비'], tags: ['게이트웨이 전원차단', '활동센서1 연결불량'], minutes: 142, detail: '게이트웨이 전원차단 + 활동센서1 연결불량', isNew: true },
  { person: mockPeople[1], statuses: ['활동미감지'], tags: [], minutes: 1080, detail: '18시간 미감지', isNew: false },
  { person: mockPeople[2], statuses: ['비정상장비'], tags: ['화재감지센서 통신불량', '출입문감지센서 통신불량'], minutes: 2880, detail: '화재+출입문 센서 통신불량 2일', isNew: false },
  { person: mockPeople[3], statuses: ['장기부재'], tags: [], minutes: 14400, detail: '장기부재 10일차', isNew: false },
  { person: mockPeople[4], statuses: ['활동미감지'], tags: [], minutes: 300, detail: '5시간 미감지', isNew: true },
  { person: mockPeople[5], statuses: ['비정상장비'], tags: ['레이더 전원차단'], minutes: 4320, detail: '레이더 전원차단 3일', isNew: false },
  { person: mockPeople[6], statuses: ['장기외출'], tags: [], minutes: 7200, detail: '장기외출 5일차', isNew: false },
  { person: mockPeople[7], statuses: ['활동미감지', '비정상장비'], tags: ['게이트웨이 미수신'], minutes: 60, detail: '게이트웨이 미수신 + 활동미감지 1시간', isNew: true },
  { person: mockPeople[8], statuses: ['비정상장비'], tags: ['호출기 통신불량'], minutes: 1440, detail: '호출기 통신불량 1일', isNew: false },
  { person: mockPeople[9], statuses: ['활동미감지'], tags: [], minutes: 480, detail: '8시간 미감지', isNew: true },
  { person: mockPeople[10], statuses: ['장기부재'], tags: [], minutes: 43200, detail: '장기부재 30일차', isNew: false },
  { person: mockPeople[11], statuses: ['비정상장비'], tags: ['활동센서2 통신불량'], minutes: 720, detail: '활동센서2 통신불량', isNew: false },
  { person: mockPeople[12], statuses: ['장기외출'], tags: [], minutes: 2880, detail: '외출 2일차', isNew: true },
  { person: mockPeople[13], statuses: ['비정상장비'], tags: ['레이더 통신불량', '화재감지센서 통신불량'], minutes: 5760, detail: '레이더+화재센서 불량 4일', isNew: false },
  { person: mockPeople[14], statuses: ['활동미감지'], tags: [], minutes: 180, detail: '3시간 미감지', isNew: true },
];

function scorePriority(statuses: StatusCategory[], tags: DeviceTag[], minutes: number): { score: number; level: PriorityLevel } {
  let score = 0;
  if (statuses.includes('활동미감지')) score += 40;
  if (statuses.includes('장기부재')) score += 15;
  if (statuses.includes('장기외출')) score += 10;
  if (statuses.includes('비정상장비')) score += 20;
  if (statuses.includes('활동미감지') && statuses.includes('비정상장비')) score += 25;
  score += Math.min(tags.length * 8, 30);
  if (minutes > 1440) score += 15;
  else if (minutes > 480) score += 10;
  else if (minutes > 120) score += 5;

  let level: PriorityLevel = 'normal';
  if (score >= 70) level = 'critical';
  else if (score >= 50) level = 'high';
  else if (score >= 30) level = 'medium';
  else if (score >= 15) level = 'low';
  return { score, level };
}

function detectTime(minutesAgo: number): string {
  const d = new Date(now.getTime() - minutesAgo * 60000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const mockCases: CaseRecord[] = statusConfigs.map((cfg, i) => {
  const { score, level } = scorePriority(cfg.statuses, cfg.tags, cfg.minutes);
  return {
    id: `case-${String(i + 1).padStart(3, '0')}`,
    snapshotId: 'snap-001',
    person: cfg.person,
    statuses: cfg.statuses,
    deviceTags: cfg.tags,
    detailText: cfg.detail,
    firstDetected: detectTime(cfg.minutes),
    elapsedTime: calcElapsed(cfg.minutes),
    elapsedMinutes: cfg.minutes,
    priority: level,
    priorityScore: score,
    actionMethod: '',
    result: '',
    note: '',
    absenceDays: cfg.statuses.includes('장기부재') ? Math.floor(cfg.minutes / 1440) : undefined,
    isNew: cfg.isNew,
    isOngoing: !cfg.isNew,
  };
});

// Sort by priority descending
mockCases.sort((a, b) => b.priorityScore - a.priorityScore);

export const mockDashboardStats: DashboardStats = {
  totalCases: mockCases.length,
  activityMissing: mockCases.filter(c => c.statuses.includes('활동미감지')).length,
  longOuting: mockCases.filter(c => c.statuses.includes('장기외출')).length,
  longAbsence: mockCases.filter(c => c.statuses.includes('장기부재')).length,
  abnormalDevice: mockCases.filter(c => c.statuses.includes('비정상장비')).length,
  criticalCount: mockCases.filter(c => c.priority === 'critical').length,
  highCount: mockCases.filter(c => c.priority === 'high').length,
  resolvedToday: 3,
  pendingAction: mockCases.filter(c => !c.result).length,
};

export const mockStaffSummary: StaffSummary[] = staffNames.map(name => {
  const cases = mockCases.filter(c => c.person.staff === name);
  return {
    staff: name,
    region: cases[0]?.person.region || '1권역',
    totalCases: cases.length,
    criticalCases: cases.filter(c => c.priority === 'critical' || c.priority === 'high').length,
    completedCases: 0,
    pendingCases: cases.length,
  };
});

export const mockSnapshots: Snapshot[] = [
  mockSnapshot,
  { id: 'snap-000', date: todayStr, time: '08:30', period: 'AM', createdAt: new Date(now.getTime() - 3600000).toISOString(), importedFiles: [], caseCount: 12 },
];
