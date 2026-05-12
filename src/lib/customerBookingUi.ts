/** Customer booking flow: sort / availability helpers (client-side). */

export type ShowingRow = {
  showing_id: number;
  showtime_date: string;
  start_time: string;
  sold: number;
  capacity: number;
  status: string;
  movie_title?: string;
  venues_name?: string;
  language?: string | null;
};

export function isMovieAvailableForBooking(status: string): boolean {
  return status === "Open";
}

export function isShowingBookable(s: ShowingRow): boolean {
  const d = String(s.showtime_date).slice(0, 10);
  const tRaw = String(s.start_time);
  const t = tRaw.length >= 8 ? tRaw.slice(0, 8) : `${tRaw}:00`.slice(0, 8);
  const startMs = new Date(`${d}T${t}`).getTime();
  if (!Number.isFinite(startMs) || startMs <= Date.now()) return false;
  if (s.status === "Full") return false;
  return Number(s.sold) < Number(s.capacity);
}

export function sortMoviesByAvailability<T extends { status: string; showtime_title?: string }>(
  list: T[],
): T[] {
  const rank = (st: string) =>
    st === "Open" ? 0 : st === "Upcoming" ? 1 : st === "Ended" ? 2 : 3;
  return [...list].sort((a, b) => {
    const dr = rank(a.status) - rank(b.status);
    if (dr !== 0) return dr;
    const ta = (a.showtime_title ?? "").toLowerCase();
    const tb = (b.showtime_title ?? "").toLowerCase();
    return ta.localeCompare(tb);
  });
}

export function sortShowingsByAvailability(list: ShowingRow[]): ShowingRow[] {
  return [...list].sort((a, b) => {
    const aa = isShowingBookable(a) ? 0 : 1;
    const bb = isShowingBookable(b) ? 0 : 1;
    if (aa !== bb) return aa - bb;
    const da = String(a.showtime_date);
    const db = String(b.showtime_date);
    if (da !== db) return da.localeCompare(db);
    return String(a.start_time).localeCompare(String(b.start_time));
  });
}
