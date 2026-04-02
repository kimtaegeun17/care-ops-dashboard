/**
 * Extract 읍/면/동 from a full Korean address.
 * e.g. "경기도 양평군 단월면 명성길120-2" → "단월면"
 */
export function extractDistrict(address: string): string {
  if (!address) return '';
  const match = address.match(/(\S+[읍면동리])\s/);
  if (match) return match[1];
  // fallback: try end of string
  const matchEnd = address.match(/(\S+[읍면동리])$/);
  if (matchEnd) return matchEnd[1];
  return address;
}

/**
 * Sort CaseRecords by 읍/면 district extracted from address.
 */
export function sortByDistrict<T extends { person: { address: string } }>(cases: T[]): T[] {
  return [...cases].sort((a, b) => {
    const da = extractDistrict(a.person.address);
    const db = extractDistrict(b.person.address);
    return da.localeCompare(db, 'ko');
  });
}

/**
 * Device tag priority order (게이트웨이 first).
 */
const DEVICE_TAG_ORDER: string[] = [
  '게이트웨이 전원차단',
  '게이트웨이 미수신',
  '활동센서1 불량',
  '활동센서2 불량',
  '화재센서 불량',
  '출입문센서 불량',
  '호출기센서 불량',
  '레이더센서 불량',
];

/**
 * Sort by deviceTag (gateway first) then by person name.
 */
export function sortByDeviceThenName<T extends { deviceTag?: string; person: { name: string } }>(cases: T[]): T[] {
  return [...cases].sort((a, b) => {
    const ia = DEVICE_TAG_ORDER.indexOf(a.deviceTag || '');
    const ib = DEVICE_TAG_ORDER.indexOf(b.deviceTag || '');
    const oa = ia >= 0 ? ia : 999;
    const ob = ib >= 0 ? ib : 999;
    if (oa !== ob) return oa - ob;
    return a.person.name.localeCompare(b.person.name, 'ko');
  });
}

/**
 * Sort abnormal device cases by the given key.
 */
export function sortDevicesByKey<T extends { deviceTag?: string; person: { name: string; address: string } }>(
  cases: T[],
  key: 'deviceTag' | 'name' | 'address'
): T[] {
  return [...cases].sort((a, b) => {
    if (key === 'deviceTag') {
      const ia = DEVICE_TAG_ORDER.indexOf(a.deviceTag || '');
      const ib = DEVICE_TAG_ORDER.indexOf(b.deviceTag || '');
      const oa = ia >= 0 ? ia : 999;
      const ob = ib >= 0 ? ib : 999;
      if (oa !== ob) return oa - ob;
      return a.person.name.localeCompare(b.person.name, 'ko');
    }
    if (key === 'address') {
      const da = extractDistrict(a.person.address);
      const db = extractDistrict(b.person.address);
      const cmp = da.localeCompare(db, 'ko');
      if (cmp !== 0) return cmp;
      return a.person.name.localeCompare(b.person.name, 'ko');
    }
    // default: name
    return a.person.name.localeCompare(b.person.name, 'ko');
  });
}
