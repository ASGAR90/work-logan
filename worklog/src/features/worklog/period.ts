import type { WorkLog } from "./workLogApi";

export type Period = "day" | "week" | "month";

/**
 * All date maths here is done on the `yyyy-MM-dd` string in local terms and
 * never through `new Date(iso)`, which would parse a bare date as UTC midnight
 * and shift the day backwards for anyone west of Greenwich.
 */

export function todayIso(): string {
  return toIso(new Date());
}

export function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function fromIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1);
}

/** Monday-based week start, matching how most timesheets are read. */
export function startOfWeek(iso: string): string {
  const date = fromIso(iso);
  const weekday = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - weekday);
  return toIso(date);
}

export function startOfMonth(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

/** The bucket an entry belongs to, used as both the group key and its sort key. */
export function bucketKey(iso: string, period: Period): string {
  if (period === "day") return iso;
  if (period === "week") return startOfWeek(iso);
  return startOfMonth(iso);
}

export function bucketLabel(key: string, period: Period): string {
  if (period === "month") {
    return fromIso(key).toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }
  if (period === "week") {
    const start = fromIso(key);
    const end = fromIso(key);
    end.setDate(end.getDate() + 6);
    // Both ends carry their month. Dropping the repeated one reads better in
    // English but there is no locale-safe day+year format to do it with --
    // Intl renders that as "2026 (day: 13)" rather than "13, 2026".
    const startText = start.toLocaleDateString(undefined, { day: "numeric", month: "short" });
    const endText = end.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
    return `${startText} – ${endText}`;
  }
  return fromIso(key).toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

export type Breakdown = { label: string; hours: number };

export type Bucket = {
  key: string;
  label: string;
  hours: number;
  entries: WorkLog[];
  byBusinessUnit: Breakdown[];
  byProject: Breakdown[];
};

/**
 * Groups entries into day/week/month buckets, newest first.
 *
 * `unspecifiedLabel` is passed in rather than hard-coded: this module has no
 * access to the translator, and the label doubles as the grouping key, so it
 * has to be resolved once by the caller instead of at render.
 */
export function groupByPeriod(entries: WorkLog[], period: Period, unspecifiedLabel = "Unspecified"): Bucket[] {
  const buckets = new Map<string, WorkLog[]>();

  for (const entry of entries) {
    if (!entry.workDate) continue;
    const key = bucketKey(entry.workDate, period);
    const existing = buckets.get(key);
    if (existing) existing.push(entry);
    else buckets.set(key, [entry]);
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, bucketEntries]) => ({
      key,
      label: bucketLabel(key, period),
      hours: totalHours(bucketEntries),
      entries: [...bucketEntries].sort((a, b) => (b.workDate ?? "").localeCompare(a.workDate ?? "")),
      byBusinessUnit: sumBy(bucketEntries, (entry) => entry.businessUnit, unspecifiedLabel),
      byProject: sumBy(bucketEntries, (entry) => entry.projectOrClient, unspecifiedLabel)
    }));
}

export function totalHours(entries: WorkLog[]): number {
  return round2(entries.reduce((sum, entry) => sum + (Number(entry.hours) || 0), 0));
}

function sumBy(entries: WorkLog[], pick: (entry: WorkLog) => string | undefined, unspecifiedLabel: string): Breakdown[] {
  const totals = new Map<string, number>();

  for (const entry of entries) {
    const label = (pick(entry) ?? "").trim() || unspecifiedLabel;
    totals.set(label, (totals.get(label) ?? 0) + (Number(entry.hours) || 0));
  }

  return [...totals.entries()]
    .map(([label, hours]) => ({ label, hours: round2(hours) }))
    .sort((a, b) => b.hours - a.hours || a.label.localeCompare(b.label));
}

/** Hours are entered to at most a quarter hour; float sums still need rounding. */
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatHours(hours: number): string {
  return `${round2(hours)}h`;
}
