import { useMemo, useRef, useState } from "react";
import type { VenueSeat } from "../../store/useShowingStore";
import { groupSeatsByRow } from "../../lib/seatRowGrouping";

type SeatPricingModalProps = {
  isOpen: boolean;
  seats: VenueSeat[];
  initialPrices: Record<number, number>;
  onClose: () => void;
  onConfirm: (seatPricing: Array<{ seatId: number; seatPrice: number }>) => void;
};

export default function SeatPricingModal({
  isOpen,
  seats,
  initialPrices,
  onClose,
  onConfirm,
}: SeatPricingModalProps) {
  const [prices, setPrices] = useState<Record<number, number>>(initialPrices);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const [setAllPriceInput, setSetAllPriceInput] = useState("280");
  const [setGroupPriceInput, setSetGroupPriceInput] = useState("280");
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<"select" | "deselect" | null>(null);
  const [dragTouchedSeatIds, setDragTouchedSeatIds] = useState<Set<number>>(
    new Set(),
  );
  const mouseHandledSeatIdRef = useRef<number | null>(null);

  const rows = useMemo(() => groupSeatsByRow(seats), [seats]);

  if (!isOpen) return null;

  const toggleSeat = (seatId: number) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seatId)) next.delete(seatId);
      else next.add(seatId);
      return next;
    });
  };

  const applySeatSelectionMode = (seatId: number, mode: "select" | "deselect") => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (mode === "select") next.add(seatId);
      else next.delete(seatId);
      return next;
    });
  };

  const stopDragSelection = () => {
    setIsDragging(false);
    setDragMode(null);
    setDragTouchedSeatIds(new Set());
  };

  const handleSeatMouseDown = (seatId: number) => {
    const mode: "select" | "deselect" = selectedSeatIds.has(seatId)
      ? "deselect"
      : "select";
    setIsDragging(true);
    setDragMode(mode);
    setDragTouchedSeatIds(new Set([seatId]));
    mouseHandledSeatIdRef.current = seatId;
    applySeatSelectionMode(seatId, mode);
  };

  const handleSeatMouseEnter = (seatId: number) => {
    if (!isDragging || !dragMode) return;
    if (dragTouchedSeatIds.has(seatId)) return;
    setDragTouchedSeatIds((prev) => new Set(prev).add(seatId));
    applySeatSelectionMode(seatId, dragMode);
  };

  const applySetAll = () => {
    const nextPrice = Number(setAllPriceInput);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0) return;
    const next: Record<number, number> = {};
    for (const seat of seats) next[seat.seat_id] = nextPrice;
    setPrices(next);
  };

  const applySelectedGroupPrice = () => {
    const nextPrice = Number(setGroupPriceInput);
    if (!Number.isFinite(nextPrice) || nextPrice <= 0 || selectedSeatIds.size === 0)
      return;
    setPrices((prev) => {
      const next = { ...prev };
      for (const seatId of selectedSeatIds) next[seatId] = nextPrice;
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedSeatIds(new Set());
  };

  const resetPrices = () => {
    setPrices(initialPrices);
  };

  const toggleRowSelection = (rowSeatIds: number[]) => {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      const everySelected = rowSeatIds.every((id) => next.has(id));
      if (everySelected) {
        for (const id of rowSeatIds) next.delete(id);
      } else {
        for (const id of rowSeatIds) next.add(id);
      }
      return next;
    });
  };

  const confirm = () => {
    const seatPricing = seats.map((seat) => ({
      seatId: seat.seat_id,
      seatPrice: Number(prices[seat.seat_id] ?? 280),
    }));
    onConfirm(seatPricing);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-login-scrim)"
      onMouseUp={stopDragSelection}
    >
      <div className="mx-4 max-h-[88vh] w-full max-w-5xl overflow-hidden rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel) shadow-xl">
        <div className="border-b border-(--color-border-dark) bg-(--color-surface-panel-mid) px-5 py-4">
          <h2 className="text-lg font-bold text-(--color-topbar-light-text)">
            Set Seat Pricing
          </h2>
          <p className="mt-1 text-xs text-(--color-text-secondary-dark)">
            Select seats to set group price, or apply one price to all seats. All
            selected seats will be saved as status Free.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4 border-b border-(--color-border-dark) bg-(--color-surface-overlay) px-5 py-4">
          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-(--color-text-secondary-dark)">
                Set all seats to
              </label>
              <input
                type="number"
                min={1}
                value={setAllPriceInput}
                onChange={(e) => setSetAllPriceInput(e.target.value)}
                className="w-28 rounded border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1 text-sm text-(--color-input-text)"
              />
            </div>
            <button
              type="button"
              onClick={applySetAll}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Apply All
            </button>
          </div>

          <div className="mx-2 hidden h-10 w-px bg-(--color-border-dark) md:block" />

          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-(--color-text-secondary-dark)">
                Set selected seats to
              </label>
              <input
                type="number"
                min={1}
                value={setGroupPriceInput}
                onChange={(e) => setSetGroupPriceInput(e.target.value)}
                className="w-28 rounded border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1 text-sm text-(--color-input-text)"
              />
            </div>
            <button
              type="button"
              onClick={applySelectedGroupPrice}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Apply Group
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="rounded border border-(--color-input-border) bg-(--color-pill-idle-bg) px-2.5 py-1 text-xs font-semibold text-(--color-pill-idle-text) hover:bg-(--color-pill-idle-bg-hover)"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={resetPrices}
              className="rounded border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-500/15"
            >
              Reset Price
            </button>
          </div>

          <div className="w-full text-xs font-semibold text-(--color-text-secondary-dark)">
            {selectedSeatIds.size} selected / {seats.length} seats
          </div>
        </div>

        <div className="max-h-[52vh] overflow-y-auto bg-(--color-surface-panel) px-5 py-4">
          <div className="flex flex-col gap-3">
            {rows.map((row) => {
              const rowSeatIds = row.seats.map((seat) => seat.seat_id);
              const rowAllSelected = rowSeatIds.every((id) =>
                selectedSeatIds.has(id),
              );
              return (
                <div
                  key={row.row}
                  className="rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel-mid) p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold text-(--color-text-primary-dark)">
                      Row {row.row}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleRowSelection(rowSeatIds)}
                      className="rounded border border-(--color-input-border) bg-(--color-input-bg) px-2 py-1 text-[11px] font-semibold text-(--color-text-secondary-dark) hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark)"
                    >
                      {rowAllSelected ? "Unselect Row" : "Select All Row"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2" onMouseLeave={stopDragSelection}>
                    {row.seats.map((seat) => {
                      const selected = selectedSeatIds.has(seat.seat_id);
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
                            handleSeatMouseDown(seat.seat_id);
                          }}
                          onMouseEnter={() => handleSeatMouseEnter(seat.seat_id)}
                          className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                            selected
                              ? "border-(--color-pill-active-border) bg-(--color-pill-active-bg) text-(--color-pill-active-text)"
                              : "border-(--color-input-border) bg-(--color-input-bg) text-(--color-text-secondary-dark) hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark)"
                          }`}
                          title={`Price: ${prices[seat.seat_id] ?? 280}฿`}
                        >
                          <span className="inline-flex items-center gap-1.5">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                                selected
                                  ? "bg-(--color-pill-active-border)/35 text-(--color-pill-active-text)"
                                  : "bg-(--color-surface-panel-mid) text-(--color-text-primary-dark)"
                              }`}
                            >
                              {seat.seat_number}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-medium leading-none ${
                                selected
                                  ? "bg-emerald-500/20 text-emerald-200"
                                  : "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                              }`}
                            >
                              {prices[seat.seat_id] ?? 280}฿
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

        <div className="flex items-center justify-end gap-3 border-t border-(--color-border-dark) bg-(--color-surface-overlay) px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-(--color-input-border) px-5 py-2 text-sm font-medium text-(--color-text-secondary-dark) hover:bg-(--color-filter-pill-idle-bg-hover)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            className="rounded bg-(--color-login-btn-bg) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-login-btn-bg-hover)"
          >
            Save Seat Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
