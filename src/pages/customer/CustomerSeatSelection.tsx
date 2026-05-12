import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { customerApi } from "@/lib/customerApi";
import { groupSeatsByRow } from "@/lib/seatRowGrouping";

type SeatRow = {
  seat_id: number;
  seat_number: string;
  status: "Free" | "Reserved" | "Confirmed";
  seat_price: number;
};

type HeadState = {
  movie_title?: string;
  venues_name?: string;
  showtime_date?: string;
  start_time?: string;
};

export default function CustomerSeatSelection() {
  const { showingId } = useParams<{ showingId: string }>();
  const sid = Number(showingId);
  const navigate = useNavigate();
  const location = useLocation();
  const head = (location.state as { head?: HeadState } | null)?.head;

  const [seats, setSeats] = useState<SeatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [submitting, setSubmitting] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect" | null>(null);
  const [dragTouchedSeatIds, setDragTouchedSeatIds] = useState<Set<number>>(
    () => new Set(),
  );
  const mouseHandledSeatIdRef = useRef<number | null>(null);

  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  const load = useCallback(async () => {
    if (!Number.isInteger(sid) || sid <= 0) return;
    setLoading(true);
    setError(null);
    try {
      const list = await customerApi.get<SeatRow[]>(`/api/customer/showings/${sid}/seats`);
      setSeats(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load seats");
    } finally {
      setLoading(false);
    }
  }, [sid]);

  useEffect(() => {
    void load();
  }, [load]);

  const stopDragSelection = useCallback(() => {
    setIsDragging(false);
    setDragMode(null);
    setDragTouchedSeatIds(new Set());
  }, []);

  useEffect(() => {
    const onUp = () => stopDragSelection();
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, [stopDragSelection]);

  const isFree = (s: SeatRow) => s.status === "Free";

  const toggleSeat = (seatId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  };

  const applySeatSelectionMode = (seatId: number, mode: "select" | "deselect") => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (mode === "select") next.add(seatId);
      else next.delete(seatId);
      return next;
    });
  };

  const handleSeatMouseDown = (seat: SeatRow) => {
    if (!isFree(seat)) return;
    const mode: "select" | "deselect" = selected.has(seat.seat_id)
      ? "deselect"
      : "select";
    setIsDragging(true);
    setDragMode(mode);
    setDragTouchedSeatIds(new Set([seat.seat_id]));
    mouseHandledSeatIdRef.current = seat.seat_id;
    applySeatSelectionMode(seat.seat_id, mode);
  };

  const handleSeatMouseEnter = (seat: SeatRow) => {
    if (!isFree(seat) || !isDragging || !dragMode) return;
    if (dragTouchedSeatIds.has(seat.seat_id)) return;
    setDragTouchedSeatIds((prev) => new Set(prev).add(seat.seat_id));
    applySeatSelectionMode(seat.seat_id, dragMode);
  };

  const clearSelection = () => setSelected(new Set());

  const toggleRowSelection = (rowSeats: SeatRow[]) => {
    const freeIds = rowSeats.filter(isFree).map((s) => s.seat_id);
    if (freeIds.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const everySelected = freeIds.every((id) => next.has(id));
      if (everySelected) freeIds.forEach((id) => next.delete(id));
      else freeIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const summary = useMemo(() => {
    const picked = seats.filter((s) => selected.has(s.seat_id));
    const total = picked.reduce((sum, s) => sum + Number(s.seat_price), 0);
    return { picked, total: Math.round(total * 100) / 100 };
  }, [seats, selected]);

  const confirm = async () => {
    if (summary.picked.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const detail = await customerApi.post<{
        booking_id: number;
      }>("/api/customer/bookings", {
        showingId: sid,
        seatIds: summary.picked.map((s) => s.seat_id),
      });
      navigate(`/booking/checkout/${detail.booking_id}`, { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not hold seats");
    } finally {
      setSubmitting(false);
    }
  };

  if (!Number.isInteger(sid) || sid <= 0) {
    return <p className="text-red-400">Invalid screening.</p>;
  }

  if (loading) {
    return <p className="text-(--color-text-muted-dark) text-center py-16">Loading seats…</p>;
  }

  const time = head?.start_time ? String(head.start_time).slice(0, 5) : "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          to="/booking/movies"
          className="text-xs text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
        >
          ← Movies
        </Link>
        <h1 className="text-2xl font-black tracking-wide uppercase mt-1">Select seats</h1>
        {head && (
          <p className="text-sm text-(--color-text-muted-dark) mt-1">
            <span className="text-(--color-text-primary-dark) font-semibold">
              {head.movie_title}
            </span>
            {" · "}
            {head.venues_name}
            {head.showtime_date ? ` · ${head.showtime_date}` : ""}
            {time ? ` · ${time}` : ""}
          </p>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-400 border border-red-900/50 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel) shadow-xl">
          <div className="border-b border-(--color-border-dark) bg-(--color-surface-panel-mid) px-5 py-4">
            <div className="text-center text-xs font-bold uppercase tracking-widest text-(--color-text-primary-dark)">
              Screen
            </div>
            <p className="mt-1 text-center text-xs text-(--color-text-secondary-dark)">
              Same layout as admin seat pricing: rows, drag to select, row select-all (free seats
              only).
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-semibold text-(--color-text-secondary-dark)">
                {selected.size} selected / {seats.filter(isFree).length} free
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="rounded border border-(--color-input-border) bg-(--color-pill-idle-bg) px-2.5 py-1 text-xs font-semibold text-(--color-pill-idle-text) hover:bg-(--color-pill-idle-bg-hover)"
              >
                Clear selection
              </button>
            </div>
          </div>

          <div
            className="max-h-[min(70vh,560px)] overflow-y-auto bg-(--color-surface-panel) px-5 py-4"
            onMouseLeave={stopDragSelection}
          >
            <div className="flex flex-col gap-3">
              {rows.map((row) => {
                const rowFreeIds = row.seats.filter(isFree).map((s) => s.seat_id);
                const rowAllSelected =
                  rowFreeIds.length > 0 && rowFreeIds.every((id) => selected.has(id));
                return (
                  <div
                    key={row.row}
                    className="rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel-mid) p-3"
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="text-xs font-bold text-(--color-text-primary-dark)">
                        Row {row.row}
                      </div>
                      <button
                        type="button"
                        disabled={rowFreeIds.length === 0}
                        onClick={() => toggleRowSelection(row.seats)}
                        className="rounded border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1 text-[11px] font-semibold text-(--color-text-secondary-dark) hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark) disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {rowAllSelected ? "Unselect row" : "Select all row"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.seats.map((seat) => {
                        const free = isFree(seat);
                        const sel = selected.has(seat.seat_id);
                        const price = Number(seat.seat_price);

                        if (!free) {
                          return (
                            <div
                              key={seat.seat_id}
                              className="cursor-not-allowed rounded-md border border-red-500/35 bg-(--color-surface-overlay) px-2 py-1.5 text-xs opacity-60"
                              title={`Taken (${seat.status})`}
                            >
                              <span className="inline-flex items-center gap-1.5">
                                <span className="rounded px-1.5 py-0.5 text-[11px] font-bold leading-none text-(--color-text-disabled-dark)">
                                  {seat.seat_number}
                                </span>
                                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium leading-none text-red-400/90">
                                  {seat.status}
                                </span>
                              </span>
                            </div>
                          );
                        }

                        return (
                          <button
                            key={seat.seat_id}
                            type="button"
                            onClick={() => {
                              if (mouseHandledSeatIdRef.current === seat.seat_id) {
                                mouseHandledSeatIdRef.current = null;
                                return;
                              }
                              toggleSeat(seat.seat_id);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSeatMouseDown(seat);
                            }}
                            onMouseEnter={() => handleSeatMouseEnter(seat)}
                            className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                              sel
                                ? "border-(--color-pill-active-border) bg-(--color-pill-active-bg) text-(--color-pill-active-text)"
                                : "border-(--color-input-border) bg-(--color-input-bg) text-(--color-text-secondary-dark) hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark)"
                            }`}
                            title={`${price}฿ · Free`}
                          >
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                                  sel
                                    ? "bg-(--color-pill-active-border)/35 text-(--color-pill-active-text)"
                                    : "bg-(--color-surface-panel-mid) text-(--color-text-primary-dark)"
                                }`}
                              >
                                {seat.seat_number}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                                  sel
                                    ? "bg-emerald-500/20 text-emerald-200"
                                    : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                                }`}
                              >
                                {price}฿
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="w-full shrink-0 rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel-mid) p-4 lg:w-80 flex flex-col gap-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-(--color-text-secondary-dark)">
            Your selection
          </h2>
          {summary.picked.length === 0 ? (
            <p className="text-sm text-(--color-text-muted-dark)">No seats yet.</p>
          ) : (
            <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
              {summary.picked.map((s) => (
                <li key={s.seat_id} className="flex justify-between gap-2">
                  <span className="text-(--color-text-primary-dark)">{s.seat_number}</span>
                  <span className="text-(--color-text-muted-dark)">{s.seat_price}฿</span>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-(--color-border-mid) pt-3 flex justify-between font-bold text-(--color-text-primary-dark)">
            <span>Total</span>
            <span>{summary.total}฿</span>
          </div>
          <button
            type="button"
            disabled={summary.picked.length === 0 || submitting}
            onClick={() => void confirm()}
            className="w-full font-bold py-2.5 rounded text-sm tracking-widest uppercase text-white bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:bg-(--color-login-btn-disabled)"
          >
            {submitting ? "Confirming…" : "Confirm seats"}
          </button>
        </aside>
      </div>
    </div>
  );
}
