/** Reminder queues do not change contact permission or authorize sending. */
export function followUpSchedule(rows, { now = Date.now(), timeZone = 'UTC' } = {}) {
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const day = value => {
    const parts = Object.fromEntries(formatter.formatToParts(value).map(p => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  };
  const today = day(now), buckets = new Map();
  const counts = { followUpOverdue: 0, followUpToday: 0, followUpUpcoming: 0 };
  for (const row of rows) {
    const due = Date.parse(row.followUpAt);
    if (row.carrierStatus !== 'follow_up' || row.hold || !Number.isFinite(due)) continue;
    const bucket = due < now ? 'overdue' : day(due) === today ? 'today' : 'upcoming';
    buckets.set(row.id, bucket);
    counts[{ overdue: 'followUpOverdue', today: 'followUpToday', upcoming: 'followUpUpcoming' }[bucket]]++;
  }
  return { buckets, counts, timeZone: formatter.resolvedOptions().timeZone };
}
