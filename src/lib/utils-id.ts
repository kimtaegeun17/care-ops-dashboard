let counter = 0;
export function v4Lite(): string {
  counter++;
  return `${Date.now().toString(36)}-${counter.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
