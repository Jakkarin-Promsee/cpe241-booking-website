import { useEffect, useMemo, useRef, useState, type ChangeEvent, type WheelEvent } from "react";
import {
  minutesToTime,
  parseTimeToMinutes,
  screeningEndExceedsTheatreClose,
} from "../../lib/screenScheduleTime";

const SLOT_START_HOUR = 10;
const SLOT_STEP_MIN = 30;
/** Last quick-slot start minute (exclusive of 22:00; with 30m steps this is 21:30). */
const LAST_QUICK_START_MIN = 22 * 60 - SLOT_STEP_MIN;

const DEFAULT_AD_MINUTES = 15;
const DEFAULT_BUFFER_MINUTES = 10;

const DEFAULT_FORM = {
  movie: "",
  language: "TH/EN",
  format: "",
  screen: "",
  date: "",
  selectedSlot: "10:00",
  startTime: "10:00",
  endTime: "12:00",
  adMinutes: DEFAULT_AD_MINUTES,
  bufferMinutes: DEFAULT_BUFFER_MINUTES,
};

export type ScreenFormState = typeof DEFAULT_FORM;
export type ExistingShowtimeSlot = {
  id: number;
  screen: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type ScreenFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: ScreenFormState) => void;
  initialData?: Partial<ScreenFormState> | null;
  /** Bumps whenever the parent opens the modal; used to re-hydrate form from `initialData`. */
  formResetKey?: number;
  isEdit?: boolean;
  movies: Array<{ title: string; duration: number }>;
  screens: string[];
  existingSlots: ExistingShowtimeSlot[];
  editingShowingId?: number;
};

function parseOverheadMinutes(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.floor(value));
  }
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

function blurNumberInputOnWheel(e: WheelEvent<HTMLInputElement>) {
  e.currentTarget.blur();
}

function ScreenFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  formResetKey = 0,
  isEdit = false,
  movies,
  screens,
  existingSlots,
  editingShowingId,
}: ScreenFormModalProps) {
  const initialDataRef = useRef(initialData);
  initialDataRef.current = initialData;

  const [form, setForm] = useState<ScreenFormState>(() => ({
    ...DEFAULT_FORM,
    ...(initialData || {}),
  }));

  useEffect(() => {
    if (!isOpen) return;
    setForm({ ...DEFAULT_FORM, ...(initialDataRef.current || {}) });
  }, [isOpen, formResetKey]);

  const movieDurationMap = useMemo(
    () => new Map(movies.map((m) => [m.title, m.duration])),
    [movies],
  );

  const timeSlots = useMemo(() => {
    const start = SLOT_START_HOUR * 60;
    const slots: string[] = [];
    for (let t = start; t <= LAST_QUICK_START_MIN; t += SLOT_STEP_MIN) {
      slots.push(minutesToTime(t));
    }
    return slots;
  }, []);

  const set =
    (field: keyof ScreenFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (field === "adMinutes" || field === "bufferMinutes") {
        const rawStr = (e.target as HTMLInputElement).value.trim();
        const n = rawStr === "" ? 0 : Number(rawStr);
        const next = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
        setForm((prev) => ({ ...prev, [field]: next }));
        return;
      }
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const selectSlot = (slot: string) =>
    setForm((prev) => ({ ...prev, selectedSlot: slot, startTime: slot }));

  useEffect(() => {
    setForm((prev) => {
      const duration = movieDurationMap.get(prev.movie) ?? 0;
      if (prev.movie && duration <= 0) return prev;
      const adMinutes = parseOverheadMinutes(prev.adMinutes);
      const bufferMinutes = parseOverheadMinutes(prev.bufferMinutes);
      const start = parseTimeToMinutes(prev.startTime);
      const computedEnd = minutesToTime(
        start + adMinutes + duration + bufferMinutes,
      );
      if (computedEnd === prev.endTime) return prev;
      return { ...prev, endTime: computedEnd };
    });
  }, [movieDurationMap, form.movie, form.startTime, form.adMinutes, form.bufferMinutes]);

  const runtimeMinutes =
    (movieDurationMap.get(form.movie) ?? 0) +
    parseOverheadMinutes(form.adMinutes) +
    parseOverheadMinutes(form.bufferMinutes);

  const startExceedsClose = useMemo(() => {
    if (runtimeMinutes <= 0) return false;
    return screeningEndExceedsTheatreClose(
      parseTimeToMinutes(form.startTime),
      runtimeMinutes,
    );
  }, [form.startTime, runtimeMinutes]);

  const canSave =
    Boolean(form.movie) &&
    Boolean(form.screen) &&
    Boolean(form.date) &&
    Boolean(form.startTime) &&
    Number(form.adMinutes) >= 0 &&
    Number(form.bufferMinutes) >= 0 &&
    !startExceedsClose;

  const conflictingSlots = useMemo(() => {
    const slots = new Set<string>();
    if (!form.screen || !form.date || runtimeMinutes <= 0) return slots;

    const relevant = existingSlots.filter(
      (s) =>
        s.screen === form.screen &&
        s.date === form.date &&
        s.id !== editingShowingId,
    );

    for (const slot of timeSlots) {
      const start = parseTimeToMinutes(slot);
      if (screeningEndExceedsTheatreClose(start, runtimeMinutes)) {
        slots.add(slot);
        continue;
      }
      const end = start + runtimeMinutes;
      const overlaps = relevant.some((s) => {
        const existingStart = parseTimeToMinutes(s.startTime);
        const existingEnd = parseTimeToMinutes(s.endTime);
        return start < existingEnd && end > existingStart;
      });
      if (overlaps) slots.add(slot);
    }
    return slots;
  }, [
    existingSlots,
    editingShowingId,
    form.screen,
    form.date,
    runtimeMinutes,
    timeSlots,
  ]);

  const handleSave = () => {
    if (!canSave) return;
    onSave(form);
    onClose();
  };

  const inputClass =
    "w-full rounded px-3 py-2 text-sm outline-none transition bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-primary-light)";

  const selectClass = `${inputClass} appearance-none pr-8`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--color-login-scrim)">
      <div className="bg-(--color-surface-card) border border-(--color-surface-card-border) rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header — light topbar tokens (same as MovieFormModal) */}
        <div className="bg-(--color-topbar-light-bg) px-5 py-4 border-b border-(--color-topbar-light-border)">
          <h2 className="text-lg font-bold text-(--color-topbar-light-text)">
            {isEdit ? "Edit Showtime" : "Add New Showtime"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4 bg-(--color-surface-card)">
          {/* Row 1: Movie / Language / Format */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Select Movie
              </label>
              <div className="relative">
                <select
                  value={form.movie}
                  onChange={set("movie")}
                  className={selectClass}
                >
                  <option value="">Choose a movie</option>
                  {movies.map((m) => (
                    <option key={m.title}>{m.title}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-text-muted-light)"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 w-24">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Language
              </label>
              <input
                type="text"
                value={form.language}
                onChange={set("language")}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5 w-20">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                3D / 2D
              </label>
              <input
                type="text"
                value={form.format}
                onChange={set("format")}
                placeholder=""
                className={inputClass}
              />
            </div>
          </div>

          {/* Row 2: Screen / Date */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Select Screen
              </label>
              <div className="relative">
                <select
                  value={form.screen}
                  onChange={set("screen")}
                  className={selectClass}
                >
                  {screens.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-text-muted-light)"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Quick Start Time
            </label>
            <div className="flex flex-wrap gap-1 rounded border border-(--color-border-light) p-1 max-h-24 overflow-y-auto">
              {timeSlots.map((slot) => {
                const disabled = conflictingSlots.has(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => selectSlot(slot)}
                    disabled={disabled}
                    title={
                      disabled
                        ? screeningEndExceedsTheatreClose(
                            parseTimeToMinutes(slot),
                            runtimeMinutes,
                          )
                          ? "Unavailable: would end after theatre close (21:59)"
                          : "Unavailable: overlaps another showtime in this hall"
                        : undefined
                    }
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap
                    ${
                      form.selectedSlot === slot
                        ? "bg-(--color-btn-secondary-bg) text-(--color-btn-secondary-text)"
                        : "bg-(--color-surface-card) text-(--color-text-secondary-light) hover:bg-(--color-filter-pill-idle-bg-hover)"
                    } disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:bg-(--color-surface-card)`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Time / End Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Start Time
              </label>
              <input
                type="time"
                value={form.startTime}
                onChange={set("startTime")}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                End Time (Auto)
              </label>
              <input
                type="time"
                value={form.endTime}
                readOnly
                className={`${inputClass} bg-(--color-surface-light)`}
              />
            </div>
          </div>
          {startExceedsClose ? (
            <p className="text-xs text-(--color-text-muted-light)">
              This start time would end after theatre close (21:59). Shorten ads/cleanup,
              pick an earlier start, or choose a shorter movie.
            </p>
          ) : null}

          {/* Runtime overheads */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="screen-form-ad-minutes"
                className="text-sm font-semibold text-(--color-text-secondary-light)"
              >
                Ads / Trailers (min)
              </label>
              <input
                id="screen-form-ad-minutes"
                type="number"
                min={0}
                step={5}
                value={form.adMinutes}
                onChange={set("adMinutes")}
                onWheel={blurNumberInputOnWheel}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label
                htmlFor="screen-form-buffer-minutes"
                className="text-sm font-semibold text-(--color-text-secondary-light)"
              >
                Cleanup Buffer (min)
              </label>
              <input
                id="screen-form-buffer-minutes"
                type="number"
                min={0}
                step={5}
                value={form.bufferMinutes}
                onChange={set("bufferMinutes")}
                onWheel={blurNumberInputOnWheel}
                className={inputClass}
              />
            </div>
          </div>

          <div className="rounded border border-(--color-border-light) bg-(--color-surface-light) px-3 py-2 text-xs text-(--color-text-secondary-light)">
            Seat pricing is configured in the next step, based on seats assigned to
            the selected venue.
          </div>
        </div>

        {/* Footer — matches MovieFormModal */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-(--color-surface-light) border-t border-(--color-border-light)">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded border text-sm font-medium transition border-(--color-border-light) text-(--color-text-secondary-light) hover:bg-(--color-filter-pill-idle-bg-hover)"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="px-5 py-2 rounded text-sm font-semibold text-white transition bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenFormModal;
