import * as XLSX from 'xlsx';
import type { CaseRecord, AsRecord } from '@/types/schema';

/**
 * Export to Excel matching the exact format of 일일점검현황 Excel file
 * Page 1: All categories in one sheet with section headers
 * Page 2: A/S management records
 */
export function exportFullReport(
  activityMissing: CaseRecord[],
  longOuting: CaseRecord[],
  longAbsence: CaseRecord[],
  abnormalDevice: CaseRecord[],
  asRecords: AsRecord[],
  dateLabel: string
) {
  const wb = XLSX.utils.book_new();

  // === Page 1: 일일점검현황 ===
  const ws1Data: (string | number)[][] = [];

  // Title row
  ws1Data.push([`일일점검대상자 ${dateLabel}`, '', '', '', '', '', '', '', '', '', '']);

  // --- 활동미감지 section ---
  ws1Data.push(['', '활동미감지6시간이상', '대상자정보', '', '', '', '장비정보', '', '', '활동미감지 정보', '']);
  ws1Data.push(['', '', '대상자명', '출생년도', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '활동미감지 시작시각', '활동미감지 지속시간']);
  activityMissing.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, c.person.address, c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // --- 장기외출 section ---
  ws1Data.push(['', '장기외출', '대상자명', '출생년도', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '외출감지 시작시각', '외출지속시간']);
  longOuting.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, c.person.address, c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // --- 장기부재 section ---
  ws1Data.push(['', '장기부재', '대상자명', '생년월일', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', 'G/W AS', '장기부재 시작일', '장기부재 지속기간']);
  longAbsence.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, c.person.address, c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // --- 비정상장비 section ---
  ws1Data.push(['', '', '대상자명', '생년월일', '도로명주소', '핸드폰번호', '게이트웨이번호', '차수', '', '전원차단 시작시각', '전원차단 지속시간']);
  abnormalDevice.forEach((c) => {
    ws1Data.push(['비', c.deviceTag || '', c.person.name, c.person.birthDate, c.person.address, c.person.phone, c.person.gwNumber || '', c.person.order || '', '', c.detectedTime, c.elapsedTime]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  // Set column widths
  ws1['!cols'] = [
    { wch: 3 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 35 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 6 }, { wch: 20 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '일일점검현황');

  // === Page 2: A/S 관리 ===
  if (asRecords.length > 0) {
    const ws2Data: (string | number)[][] = [];
    ws2Data.push(['차수', '면', '대상자', '생년월일', 'G/W번호', '장비명', '세부사항', 'as입고일자', '택배발송&요청일자', '설치완료일자/도착일자', '설치비고', '보급완료갯수확인']);
    asRecords.forEach(r => {
      ws2Data.push([r.order, r.region, r.name, r.birthDate, r.gwNumber, r.deviceName, r.detail, r.asReceiveDate, r.deliveryRequestDate, r.installCompleteDate, r.installNote, r.supplyCount]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(ws2Data);
    ws2['!cols'] = [
      { wch: 5 }, { wch: 8 }, { wch: 8 }, { wch: 10 }, { wch: 14 },
      { wch: 12 }, { wch: 40 }, { wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 12 }, { wch: 14 }
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'A/S 관리');
  }

  XLSX.writeFile(wb, `일일점검현황_${dateLabel.replace(/[^0-9]/g, '')}.xlsx`);
}

export function printTable() {
  window.print();
}
