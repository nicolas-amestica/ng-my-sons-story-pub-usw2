export interface LiveAge {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function computeLiveAge(birthIso: string, now = new Date()): LiveAge {
  const birth = new Date(birthIso);
  const zero: LiveAge = { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  if (isNaN(birth.getTime()) || now <= birth) return zero;

  const addYears = (d: Date, n: number) => { const r = new Date(d); r.setUTCFullYear(r.getUTCFullYear() + n); return r; };
  const addMonths = (d: Date, n: number) => { const r = new Date(d); r.setUTCMonth(r.getUTCMonth() + n); return r; };
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setUTCDate(r.getUTCDate() + n); return r; };

  let t = birth;
  let years = 0, months = 0, days = 0;

  let next = addYears(t, 1);
  while (next.getTime() <= now.getTime()) { t = next; years++; next = addYears(t, 1); }

  next = addMonths(t, 1);
  while (next.getTime() <= now.getTime()) { t = next; months++; next = addMonths(t, 1); }

  next = addDays(t, 1);
  while (next.getTime() <= now.getTime()) { t = next; days++; next = addDays(t, 1); }

  const remainMs = now.getTime() - t.getTime();
  const hours = Math.floor(remainMs / 3600000);
  const minutes = Math.floor((remainMs % 3600000) / 60000);
  const seconds = Math.floor((remainMs % 60000) / 1000);

  return { years, months, days, hours, minutes, seconds };
}

export function formatLiveAge(a: LiveAge): string {
  return `${a.years}a ${a.months}m ${a.days}d ${a.hours}h ${a.minutes}min ${a.seconds}s`;
}
