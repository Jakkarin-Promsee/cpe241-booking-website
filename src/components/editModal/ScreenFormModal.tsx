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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-neutral-200 px-5 py-4 border-b border-neutral-300">
          <h2 className="text-lg font-bold text-neutral-900">
            {isEdit ? "Edit Showtime" : "Add New Showtime"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-5 py-5 flex flex-col gap-4 bg-white">
          {/* Row 1: Movie / Language / Format */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">Select Movie</label>
              <div className="relative">
                <select
                  value={form.movie}
                  onChange={set("movie")}
                  className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-600 bg-white pr-8"
                >
                  <option value="">Choose a movie</option>
                  {MOVIES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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
              <label className="text-sm text-neutral-700">Language</label>
              <input
                type="text"
                value={form.language}
                onChange={set("language")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600"
              />
            </div>

            <div className="flex flex-col gap-1.5 w-20">
              <label className="text-sm text-neutral-700">3D / 2D</label>
              <input
                type="text"
                value={form.format}
                onChange={set("format")}
                placeholder=""
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Row 2: Screen / Date */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">Select Screen</label>
              <div className="relative">
                <select
                  value={form.screen}
                  onChange={set("screen")}
                  className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-600 bg-white pr-8"
                >
                  {SCREENS.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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
              <label className="text-sm text-neutral-700">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={set("date")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Time Slot Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-neutral-700">Time Slot</label>
            <div className="flex gap-0 border border-neutral-400 rounded overflow-hidden">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => selectSlot(slot)}
                  className={`flex-1 py-2 text-xs font-medium border-r border-neutral-300 last:border-r-0 transition-colors whitespace-nowrap
                    ${
                      form.selectedSlot === slot
                        ? "bg-neutral-400 text-white"
                        : "bg-white text-neutral-700 hover:bg-neutral-100"
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
              <label className="text-sm text-neutral-700">Start Time</label>
              <input
                type="text"
                value={form.startTime}
                onChange={set("startTime")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600"
              />
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">End Time</label>
              <input
                type="text"
                value={form.endTime}
                onChange={set("endTime")}
                className="w-full border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Seat Plan / Seat Price */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-sm text-neutral-700">
                Seat Plan Template
              </label>
              <div className="relative">
                <select
                  value={form.seatPlan}
                  onChange={set("seatPlan")}
                  className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-600 bg-white pr-8"
                >
                  {SEAT_PLANS.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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
              <label className="text-sm text-neutral-700">Seat Price</label>
              <div className="relative">
                <select
                  value={form.seatPrice}
                  onChange={set("seatPrice")}
                  className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-600 bg-white pr-8"
                >
                  {SEAT_PRICES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-neutral-100 border-t border-neutral-200">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded border border-neutral-400 text-sm font-medium text-neutral-700 hover:bg-neutral-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded bg-neutral-900 text-sm font-semibold text-white hover:bg-neutral-700 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenFormModal;
