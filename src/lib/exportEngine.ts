import * as XLSX from 'xlsx';
import type { CaseRecord } from '@/types/schema';
import { extractDistrict } from '@/lib/addressUtils';

export function exportFullReport(
  activityMissing: CaseRecord[],
  longOuting: CaseRecord[],
  longAbsence: CaseRecord[],
  abnormalDevice: CaseRecord[],
  dateLabel: string
) {
  const wb = XLSX.utils.book_new();
  const ws1Data: (string | number)[][] = [];

  ws1Data.push([`일일점검대상자 ${dateLabel}`, '', '', '', '', '', '', '', '', '', '']);

  // 활동미감지
  ws1Data.push(['', '활동미감지6시간이상', '대상자정보', '', '', '', '장비정보', '', '', '감지정보', '']);
  ws1Data.push(['', '', '대상자명', '출생년도', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']);
  activityMissing.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, extractDistrict(c.person.address), c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // 장기외출
  ws1Data.push(['', '장기외출', '대상자명', '출생년도', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']);
  longOuting.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, extractDistrict(c.person.address), c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // 장기부재
  ws1Data.push(['', '장기부재', '대상자명', '생년월일', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작일', '지속기간']);
  longAbsence.forEach((c, i) => {
    ws1Data.push(['', i + 1, c.person.name, c.person.birthDate, extractDistrict(c.person.address), c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  // 비정상장비 - with address (district only), sorted by district
  const sortedDevices = sortByDeviceThenName(abnormalDevice);
  ws1Data.push(['비', '장비이상', '대상자명', '생년월일', '도로명주소', '핸드폰번호', 'G/W번호', '차수', 'G/W AS', '시작시각', '지속시간']);
  sortedDevices.forEach((c) => {
    ws1Data.push(['비', c.deviceTag || '', c.person.name, c.person.birthDate, extractDistrict(c.person.address), c.person.phone, c.person.gwNumber || '', c.person.order || '', c.gwAs || '', c.detectedTime, c.elapsedTime]);
  });

  const ws1 = XLSX.utils.aoa_to_sheet(ws1Data);
  ws1['!cols'] = [
    { wch: 3 }, { wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 8 }, { wch: 18 }, { wch: 12 }
  ];
  XLSX.utils.book_append_sheet(wb, ws1, '일일점검현황');

  XLSX.writeFile(wb, `일일점검현황_${dateLabel.replace(/[^0-9]/g, '')}.xlsx`);
}

export function printTable() {
  window.print();
}
