// Core types for the emergency care daily check system

export type StatusCategory = '활동미감지' | '장기외출' | '장기부재' | '비정상장비';

export type DeviceTag =
  | '게이트웨이 전원차단'
  | '게이트웨이 미수신'
  | '활동센서1 불량'
  | '활동센서2 불량'
  | '화재센서 불량'
  | '출입문센서 불량'
  | '호출기센서 불량'
  | '레이더센서 불량';

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
  homePhone?: string;
  address: string;
  region: string;       // 권역/면
  staff: string;        // 담당자
  gwNumber?: string;    // G/W번호
  order?: string;       // 차수 (20년 댁내, 21년 댁내 등)
}

export interface CaseRecord {
  id: string;
  person: Person;
  category: StatusCategory;
  deviceTag?: DeviceTag;       // For 비정상장비 only
  detectedTime: string;        // 시작시각/시작일
  elapsedTime: string;         // 지속시간
  elapsedMinutes: number;
  gwAs?: string;               // G/W AS (AS중 등)
  actionMethod: ActionMethod | '';
  result: ActionResult | '';
  note: string;
}

// A/S 관리 레코드 (Page 2 of real excel)
export interface AsRecord {
  id: string;
  order: string;               // 차수
  region: string;              // 면 (용문면, 지평면 등)
  name: string;                // 대상자
  birthDate: string;           // 생년월일
  gwNumber: string;            // G/W번호
  deviceName: string;          // 장비명 (게이트웨이, 레이더센서, 화재감지기 등)
  detail: string;              // 세부사항
  asReceiveDate: string;       // as입고일자
  deliveryRequestDate: string; // 택배발송&요청일자
  installCompleteDate: string; // 설치완료일자/도착일자
  installNote: string;         // 설치비고
  supplyCount: string;         // 보급완료갯수확인
}

export interface DailyData {
  date: string;              // YYYY-MM-DD
  lastUpdated: string;       // ISO timestamp
  activityMissing: CaseRecord[];  // 활동미감지 6시간 이상
  longOuting: CaseRecord[];       // 장기외출
  longAbsence: CaseRecord[];      // 장기부재
  abnormalDevice: CaseRecord[];   // 비정상장비
  asRecords: AsRecord[];          // A/S 관리
}

export interface ImportedFile {
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
}
