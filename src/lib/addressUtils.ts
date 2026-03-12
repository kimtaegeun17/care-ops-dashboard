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
