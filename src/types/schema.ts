// Core types for the emergency care daily check system

export type StatusCategory = '활동미감지' | '장기외출' | '장기부재' | '비정상장비';

export type DeviceTag =
  | '게이트웨이 전원차단'
  | '게이트웨이 미수신'
  | '활동센서1 연결불량'
  | '활동센서2 통신불량'
  | '화재감지센서 통신불량'
  | '출입문감지센서 통신불량'
  | '호출기 통신불량'
  | '레이더 전원차단'
  | '레이더 통신불량';

export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'normal';

export type ActionMethod = '전화확인' | '방문확인' | 'A/S접수' | '119신고' | '보호자연락' | '기타';

export type ActionResult = '확인완료' | '미확인' | '조치완료' | '조치중' | '대기';

export type FileType =
  | '활동미감지'
  | '외출중'
  | '장기부재자'
  | '게이트웨이_전원차단'
  | '게이트웨이_미수신'
  | '활동감지센서1_통신차단'
  | '활동감지센서2_통신차단'
  | '화재감지센서_통신차단'
  | '출입문_통신차단'
  | '호출기_통신차단'
  | '레이더센서_전원차단'
  | '레이더센서_통신차단';

export interface Person {
  id: string;
  name: string;
  birthDate: string;
  phone: string;
  address: string;
  region: string;       // 권역
  staff: string;        // 담당자
  gwNumber?: string;    // G/W번호
}

export interface CaseRecord {
  id: string;
  snapshotId: string;
  person: Person;
  statuses: StatusCategory[];
  deviceTags: DeviceTag[];
  detailText: string;       // 세부이상
  firstDetected: string;    // 최초감지시각
  elapsedTime: string;      // 경과시간
  elapsedMinutes: number;
  priority: PriorityLevel;
  priorityScore: number;
  actionMethod: ActionMethod | '';
  result: ActionResult | '';
  note: string;             // 비고
  asStatus?: string;        // A/S status
  absenceDays?: number;     // 장기부재 경과일
  isNew?: boolean;          // new since last snapshot
  isResolved?: boolean;     // resolved since last snapshot
  isOngoing?: boolean;      // ongoing from last snapshot
}

export interface Snapshot {
  id: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  period: 'AM' | 'PM';
  createdAt: string;
  importedFiles: ImportedFile[];
  caseCount: number;
}

export interface ImportedFile {
  id: string;
  snapshotId: string;
  fileName: string;
  fileType: FileType;
  rowCount: number;
  importedAt: string;
}

export interface DashboardStats {
  totalCases: number;
  activityMissing: number;
  longOuting: number;
  longAbsence: number;
  abnormalDevice: number;
  criticalCount: number;
  highCount: number;
  resolvedToday: number;
  pendingAction: number;
}

export interface StaffSummary {
  staff: string;
  region: string;
  totalCases: number;
  criticalCases: number;
  completedCases: number;
  pendingCases: number;
}

// Unified output row (for table display)
export interface UnifiedRow {
  순번: number;
  권역: string;
  담당자: string;
  대상자명: string;
  생년월일: string;
  연락처: string;
  주소: string;
  상태구분: string;
  세부이상: string;
  최초감지시각: string;
  경과시간: string;
  우선순위: string;
  조치방법: string;
  결과: string;
  비고: string;
}
