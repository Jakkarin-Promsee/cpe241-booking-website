import { useState } from "react";
import {
  THEATERS,
  SCREENS,
  MOVIE_COLORS,
  INITIAL_SHOWTIMES,
} from "../store/tempScreenData";
import ScreenFormModal, {
  type ScreenFormState,
} from "../components/editModal/ScreenFormModal";

type ShowtimeRow = (typeof INITIAL_SHOWTIMES)[number] & {
  language?: string;
  format?: string;
  date?: string;
  seatPlan?: string;
  seatPrice?: string;
};

function hourToTimeStr(startHour: number) {
  const h = Math.floor(startHour);
  const m = Math.round((startHour % 1) * 60);
  return `${String(h).padStart(2, "0")}.${String(m).padStart(2, "0")}`;
}

function showtimeToFormFields(
  s: ShowtimeRow,
  fallbackDate: string,
): ScreenFormState {
  const startTime = hourToTimeStr(s.startHour);
  const endTotal = s.startHour + s.durationMin / 60;
  const endH = Math.floor(endTotal);
  const endM = Math.round((endTotal % 1) * 60);
  const endTime = `${String(endH).padStart(2, "0")}.${String(endM).padStart(2, "0")}`;
  return {
    movie: s.movie ?? "",
    language: s.language ?? "TH/EN",
    format: s.format ?? "",
    screen: s.screen ?? "Screen 1",
    date: s.date ?? fallbackDate ?? "",
    selectedSlot: startTime,
    startTime,
    endTime,
    seatPlan: s.seatPlan ?? "Standard 150 seats",
    seatPrice: s.seatPrice ?? "Weekend price",
  };
}

function parseTimeToHour(str: string) {
  if (!str || typeof str !== "string") return 0;
  const normalized = str.trim().replace(":", ".");
  const parts = normalized.split(".");
  const h = Number(parts[0]) || 0;
  const m = parts.length > 1 ? Number(parts[1]) || 0 : 0;
  return h + m / 60;
}

function formToShowtimePatch(
  form: ScreenFormState,
  existing: ShowtimeRow | null,
) {
  const startHour = parseTimeToHour(form.startTime);
  const endHour = parseTimeToHour(form.endTime);
  let durationMin = Math.round((endHour - startHour) * 60);
  if (!Number.isFinite(durationMin) || durationMin < 0) {
    durationMin = existing?.durationMin ?? 90;
  }
  if (durationMin === 0 && existing?.durationMin) {
    durationMin = existing.durationMin;
  }
  return {
    screen: form.screen,
    movie: form.movie,
    startHour,
    durationMin,
    language: form.language,
    format: form.format,
    date: form.date,
    seatPlan: form.seatPlan,
    seatPrice: form.seatPrice,
  };
}

const HOUR_START = 10;
const HOUR_END = 22;
const HOURS = Array.from(
  { length: HOUR_END - HOUR_START },
  (_, i) => HOUR_START + i,
);

const TOTAL_HOURS = HOUR_END - HOUR_START;
const LABEL_COL_WIDTH = 80; // px
const CELL_WIDTH = 80; // px per hour

function toPercent(hour: number) {
  return ((hour - HOUR_START) / TOTAL_HOURS) * 100;
}

function ShowtimeBlock({ showtime }: { showtime: ShowtimeRow }) {
  const leftPct = toPercent(showtime.startHour);
  const widthPct = (showtime.durationMin / 60 / TOTAL_HOURS) * 100;
  const movieKey = showtime.movie as keyof typeof MOVIE_COLORS;
  const colors = MOVIE_COLORS[movieKey] ?? {
    bg: "bg-gray-300",
    text: "text-gray-900",
  };

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-md px-2 py-1 flex flex-col justify-center overflow-hidden cursor-pointer select-none ${colors.bg} ${colors.text} hover:brightness-95 transition-all`}
      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
      title={`${showtime.movie} — ${showtime.durationMin} min`}
    >
      <p className="text-xs font-bold leading-tight truncate">
        {showtime.movie}
      </p>
      <p className="text-[10px] leading-tight opacity-80">
        {showtime.durationMin} min
      </p>
    </div>
  );
}

function TimelineGrid({ showtimes }: { showtimes: ShowtimeRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-600">
      <div style={{ minWidth: LABEL_COL_WIDTH + CELL_WIDTH * TOTAL_HOURS }}>
        {/* Hour header */}
        <div className="flex bg-neutral-900 border-b border-neutral-600">
          <div style={{ width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }} />
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
              className="text-center text-xs text-neutral-300 py-2 border-l border-neutral-600"
            >
              {String(h).padStart(2, "0")}:00
            </div>
          ))}
        </div>

        {/* Screen rows */}
        {SCREENS.map((screen) => {
          const rowShowtimes = showtimes.filter((s) => s.screen === screen);
          return (
            <div
              key={screen}
              className="flex border-b border-neutral-700 last:border-b-0"
              style={{ height: 64 }}
            >
              {/* Screen label */}
              <div
                style={{ width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="flex items-center justify-center text-xs font-semibold text-neutral-300 bg-neutral-800 border-r border-neutral-600 shrink-0"
              >
                {screen}
              </div>

              {/* Timeline cells */}
              <div className="relative flex-1 bg-neutral-900">
                {/* Vertical hour lines */}
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-neutral-700"
                    style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                  />
                ))}
                {/* Showtime blocks */}
                {rowShowtimes.map((s) => (
                  <ShowtimeBlock key={s.id} showtime={s} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ShowtimesTable({
  showtimes,
  onDelete,
  onEdit,
}: {
  showtimes: ShowtimeRow[];
  onDelete: (id: number) => void;
  onEdit: (s: ShowtimeRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-600">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-neutral-700">
            {[
              "Movie Title",
              "Start Time",
              "End Time",
              "Seats Sold",
              "Status",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="px-4 py-3 text-left text-sm font-semibold text-neutral-200 border border-neutral-600 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {showtimes.map((s) => {
            const startH = Math.floor(s.startHour);
            const startM = Math.round((s.startHour % 1) * 60);
            const endTotal = s.startHour + s.durationMin / 60;
            const endH = Math.floor(endTotal);
            const endM = Math.round((endTotal % 1) * 60);
            const fmt = (h: number, m: number) =>
              `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

            return (
              <tr
                key={s.id}
                className="border-b border-neutral-700 hover:bg-neutral-700/30 transition-colors"
              >
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-200 font-medium">
                  {s.movie}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300">
                  {fmt(startH, startM)}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300">
                  {fmt(endH, endM)}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300">
                  —
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm font-semibold text-neutral-200">
                  {s.status}
                </td>
                <td className="px-4 py-3 border border-neutral-700">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(s)}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-neutral-600 transition-colors group"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-neutral-300 group-hover:text-white"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200">
                        Edit
                      </span>
                    </button>
                    <button
                      onClick={() => onDelete(s.id)}
                      className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-red-900/40 transition-colors group"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-neutral-300 group-hover:text-red-400"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                      <span className="text-[10px] text-neutral-400 group-hover:text-red-400">
                        Delete
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}

          {showtimes.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-10 text-center text-neutral-500 text-sm"
              >
                No showtimes for this theater and date.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function ScreenManagementPage() {
  const [selectedTheater, setSelectedTheater] = useState("Theater 1");
  const [theaterOpen, setTheaterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [showtimes, setShowtimes] = useState<ShowtimeRow[]>(INITIAL_SHOWTIMES);
  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeRow | null>(
    null,
  );
  const [showtimeFormKey, setShowtimeFormKey] = useState(0);

  const openAddShowtime = () => {
    setEditingShowtime(null);
    setShowtimeFormKey((k) => k + 1);
    setShowtimeModalOpen(true);
  };

  const openEditShowtime = (s: ShowtimeRow) => {
    setEditingShowtime(s);
    setShowtimeFormKey((k) => k + 1);
    setShowtimeModalOpen(true);
  };

  const closeShowtimeModal = () => {
    setShowtimeModalOpen(false);
    setEditingShowtime(null);
  };

  const handleSaveShowtime = (form: ScreenFormState) => {
    const patch = formToShowtimePatch(form, editingShowtime);
    if (editingShowtime) {
      setShowtimes((prev) =>
        prev.map((s) => (s.id === editingShowtime.id ? { ...s, ...patch } : s)),
      );
    } else {
      setShowtimes((prev) => {
        const nextId = Math.max(0, ...prev.map((s) => s.id)) + 1;
        return [
          ...prev,
          {
            id: nextId,
            status: "Active",
            ...patch,
          },
        ];
      });
    }
  };

  const handleDelete = (id: number) => {
    setShowtimes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-neutral-800 p-5 gap-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Theater selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-200 whitespace-nowrap">
            Select Theater
          </span>
          <div className="relative">
            <button
              onClick={() => setTheaterOpen((o) => !o)}
              className="flex items-center gap-2 bg-neutral-600 border border-neutral-500 rounded px-4 py-1.5 text-sm text-neutral-100 min-w-[130px] justify-between"
            >
              {selectedTheater}
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="text-neutral-300"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {theaterOpen && (
              <div className="absolute top-full left-0 mt-1 bg-neutral-600 border border-neutral-500 rounded shadow-lg z-20 min-w-full">
                {THEATERS.map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      setSelectedTheater(t);
                      setTheaterOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-neutral-500 transition-colors
                      ${t === selectedTheater ? "text-white font-semibold" : "text-neutral-200"}`}
                  >
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Date picker */}
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-400 transition"
          placeholder="Select Date"
        />

        <div className="flex-1" />

        {/* Add showtime */}
        <button
          type="button"
          onClick={openAddShowtime}
          className="bg-neutral-100 hover:bg-white text-neutral-900 text-sm font-semibold px-4 py-1.5 rounded transition-colors whitespace-nowrap"
        >
          + Add Showtime
        </button>
      </div>

      {/* Timeline */}
      <TimelineGrid showtimes={showtimes} />

      {/* Table */}
      <ShowtimesTable
        showtimes={showtimes}
        onDelete={handleDelete}
        onEdit={openEditShowtime}
      />

      <ScreenFormModal
        key={`${editingShowtime?.id ?? "new"}-${showtimeFormKey}`}
        isOpen={showtimeModalOpen}
        onClose={closeShowtimeModal}
        onSave={handleSaveShowtime}
        isEdit={!!editingShowtime}
        initialData={
          editingShowtime
            ? showtimeToFormFields(editingShowtime, selectedDate)
            : selectedDate
              ? { date: selectedDate }
              : null
        }
      />
    </div>
  );
}
