import { useState, type ChangeEvent } from "react";
import { MOVIES as MOVIE_LIST } from "../../store/tempMoiveData";
import { SCREENS } from "../../store/tempScreenData";

const MOVIES = MOVIE_LIST.map((m) => m.title);
const SEAT_PLANS = ["Standard 150 seats", "VIP 60 seats", "Standard 200 seats"];
const SEAT_PRICES = [
  "Weekend price",
  "Weekday price",
  "Holiday price",
  "Student price",
];
const TIME_SLOTS = [
  "10.00",
  "10.15",
  "10.30",
  "10.45",
  "11.00",
  "11.15",
  "11.30",
  "11.45",
  "12.00",
];

const DEFAULT_FORM = {
  movie: "",
  language: "TH/EN",
  format: "",
  screen: "Screen 1",
  date: "",
  selectedSlot: "10.30",
  startTime: "10.00",
  endTime: "12.00",
  seatPlan: "Standard 150 seats",
  seatPrice: "Weekend price",
};

export type ScreenFormState = typeof DEFAULT_FORM;

type ScreenFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (form: ScreenFormState) => void;
  initialData?: Partial<ScreenFormState> | null;
  isEdit?: boolean;
};

function ScreenFormModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  isEdit = false,
}: ScreenFormModalProps) {
  const [form, setForm] = useState<ScreenFormState>(() => ({
    ...DEFAULT_FORM,
    ...(initialData || {}),
  }));

  if (!isOpen) return null;

  const set =
    (field: keyof ScreenFormState) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const selectSlot = (slot: string) =>
    setForm((prev) => ({ ...prev, selectedSlot: slot, startTime: slot }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  const inputClass =
    "w-full rounded px-3 py-2 text-sm outline-none transition bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-primary-light)";

  const selectClass = `${inputClass} appearance-none pr-8`;

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
                  {MOVIES.map((m) => (
                    <option key={m}>{m}</option>
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
                  {SCREENS.map((s) => (
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
              Time Slot
            </label>
            <div className="flex gap-0 border border-(--color-border-light) rounded overflow-hidden">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => selectSlot(slot)}
                  className={`flex-1 py-2 text-xs font-medium border-r border-(--color-border-light) last:border-r-0 transition-colors whitespace-nowrap
                    ${
                      form.selectedSlot === slot
                        ? "bg-(--color-btn-secondary-bg) text-(--color-btn-secondary-text)"
                        : "bg-(--color-surface-card) text-(--color-text-secondary-light) hover:bg-(--color-filter-pill-idle-bg-hover)"
                    }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Start Time / End Time */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Start Time
              </label>
              <input
                type="text"
                value={form.startTime}
                onChange={set("startTime")}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                End Time
              </label>
              <input
                type="text"
                value={form.endTime}
                onChange={set("endTime")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Seat Plan / Seat Price */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm font-semibold text-(--color-text-secondary-light)">
                Seat Plan Template
              </label>
              <div className="relative">
                <select
                  value={form.seatPlan}
                  onChange={set("seatPlan")}
                  className={selectClass}
                >
                  {SEAT_PLANS.map((p) => (
                    <option key={p}>{p}</option>
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
                Seat Price
              </label>
              <div className="relative">
                <select
                  value={form.seatPrice}
                  onChange={set("seatPrice")}
                  className={selectClass}
                >
                  {SEAT_PRICES.map((p) => (
                    <option key={p}>{p}</option>
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
            className="px-5 py-2 rounded text-sm font-semibold text-white transition bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover)"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenFormModal;
