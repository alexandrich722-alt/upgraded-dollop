// NOVA Life OS — Pure Helper Functions
// No side effects, no React coupling, fully tree-shakeable

export const uid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 11) + Date.now().toString(36);
};

export const now = (): string => new Date().toISOString();

export const todayStr = (): string => new Date().toISOString().split('T')[0];

export const monthStr = (): string => new Date().toISOString().slice(0, 7);

export const daysAgo = (n: number): string => new Date(Date.now() - n * 86400000).toISOString();
export const daysAhead = (n: number): string => new Date(Date.now() + n * 86400000).toISOString();

export const daysBetween = (a: string, b: string): number =>
  Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export const isOverdue = (deadline: string | null): boolean =>
  deadline ? new Date(deadline) < new Date() : false;

export const isToday = (dateStr: string): boolean =>
  dateStr?.startsWith(todayStr()) ?? false;

export const isThisMonth = (dateStr: string): boolean =>
  dateStr?.startsWith(monthStr()) ?? false;

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v));

export const safeArr = <T>(v: unknown): T[] => Array.isArray(v) ? v as T[] : [];
export const safeStr = (v: unknown, d = ''): string => typeof v === 'string' ? v : d;
export const safeNum = (v: unknown, d = 0): number => typeof v === 'number' && !isNaN(v) ? v : d;
export const safeBool = (v: unknown, d = false): boolean => typeof v === 'boolean' ? v : d;

export const sortByPriority = <T extends { priority: string }>(items: T[]): T[] =>
  [...items].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2);
  });

export const groupBy = <T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};
  items.forEach(item => {
    const key = keyFn(item);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return groups;
};

export const uniqueBy = <T>(items: T[], keyFn: (item: T) => string): T[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const sum = (items: number[]): number => items.reduce((a, b) => a + b, 0);
export const avg = (items: number[]): number => items.length ? sum(items) / items.length : 0;
