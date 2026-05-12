/** Last second the hall is open (matches seed / business rule). */
export const THEATRE_CLOSE_SECONDS = 21 * 3600 + 59 * 60 + 59; // 21:59:59

/**
 * True if feature + ads + cleanup would still be running after {@link THEATRE_CLOSE_SECONDS}.
 * Uses minute-based start + runtime (same granularity as quick slots and form).
 */
export function screeningEndExceedsTheatreClose(
  startMinutesSinceMidnight: number,
  totalRuntimeMinutes: number,
): boolean {
  const startSec = Math.round(startMinutesSinceMidnight) * 60;
  const runSec = Math.round(totalRuntimeMinutes) * 60;
  return startSec + runSec > THEATRE_CLOSE_SECONDS;
}

/** Parse `HH:MM` or `HH:MM:SS` from `<input type="time">` / API to minutes since midnight. */
export function parseTimeToMinutes(time: string): number {
  if (!time) return 0;
  const parts = time.trim().split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  return h * 60 + m;
}

/** Format minutes since midnight as `HH:MM` (24h, wraps past midnight). */
export function minutesToTime(totalMinutes: number): string {
  const minsInDay = 24 * 60;
  const normalized =
    ((Math.round(totalMinutes) % minsInDay) + minsInDay) % minsInDay;
  const hh = Math.floor(normalized / 60);
  const mm = normalized % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}
