import { useState } from "react";
import {
  THEATERS,
  SCREENS,
  MOVIE_PALETTE_KEY,
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
const CELL_WIDTH = 95; // px per hour
/** Taller rows so the theater schedule timeline is easier to read */
const TIMELINE_ROW_HEIGHT_PX = 88;

function toPercent(hour: number) {
  return ((hour - HOUR_START) / TOTAL_HOURS) * 100;
}

function ShowtimeBlock({
  showtime,
  onEdit,
}: {
  showtime: ShowtimeRow;
  onEdit: (s: ShowtimeRow) => void;
}) {
  const leftPct = toPercent(showtime.startHour);
  const widthPct = (showtime.durationMin / 60 / TOTAL_HOURS) * 100;
  const paletteKey = MOVIE_PALETTE_KEY[showtime.movie] ?? "a";

  return (
    <div
      className="absolute top-1 bottom-1 rounded-md px-2 py-1 flex flex-col justify-center overflow-hidden select-none hover:brightness-95 transition-all"
      style={{
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        backgroundColor: `var(--color-movie-${paletteKey}-bg)`,
        color: `var(--color-movie-${paletteKey}-text)`,
      }}
      title={`${showtime.movie} — ${showtime.durationMin} min`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(showtime);
        }}
        className="absolute top-0.5 right-0.5 z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-black/30 hover:bg-black/45 text-current"
        title="Edit showtime"
        aria-label="Edit showtime"
      >
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-95"
        >
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      <p className="text-xs font-bold leading-tight truncate pr-5">
        {showtime.movie}
      </p>
      <p className="text-[10px] leading-tight opacity-80 pr-5">
        {showtime.durationMin} min
      </p>
    </div>
  );
}

function TimelineGrid({
  showtimes,
  onEditShowtime,
}: {
  showtimes: ShowtimeRow[];
  onEditShowtime: (s: ShowtimeRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-(--color-border-dark)">
      <div style={{ minWidth: LABEL_COL_WIDTH + CELL_WIDTH * TOTAL_HOURS }}>
        {/* Hour header */}
        <div className="flex bg-(--color-surface-overlay) border-b border-(--color-border-dark)">
          <div style={{ width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }} />
          {HOURS.map((h) => (
            <div
              key={h}
              style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
              className="text-center text-xs py-2 border-l border-(--color-border-dark) text-(--color-text-secondary-dark)"
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
              className="flex border-b border-(--color-border-mid) last:border-b-0"
              style={{ height: TIMELINE_ROW_HEIGHT_PX }}
            >
              {/* Screen label */}
              <div
                style={{ width: LABEL_COL_WIDTH, minWidth: LABEL_COL_WIDTH }}
                className="flex items-center justify-center text-xs font-semibold shrink-0 bg-(--color-surface-panel) border-r border-(--color-border-dark) text-(--color-text-secondary-dark)"
              >
                {screen}
              </div>

              {/* Timeline cells */}
              <div className="relative flex-1 bg-(--color-surface-overlay)">
                {/* Vertical hour lines */}
                {HOURS.map((h, i) => (
                  <div
                    key={h}
                    className="absolute top-0 bottom-0 border-l border-(--color-border-mid)"
                    style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                  />
                ))}
                {/* Showtime blocks */}
                {rowShowtimes.map((s) => (
                  <ShowtimeBlock
                    key={s.id}
                    showtime={s}
                    onEdit={onEditShowtime}
                  />
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
    <div className="overflow-x-auto rounded-lg border border-(--color-border-dark)">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-(--color-surface-panel-mid)">
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
                className="px-4 py-3 text-left text-sm font-semibold border whitespace-nowrap border-(--color-border-dark) text-(--color-text-primary-dark)"
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
                className="border-b border-(--color-border-mid) transition-colors hover:bg-(--color-table-row-hover)"
              >
                <td className="px-4 py-3 border text-sm font-medium border-(--color-border-mid) text-(--color-text-primary-dark)">
                  {s.movie}
                </td>
                <td className="px-4 py-3 border text-sm border-(--color-border-mid) text-(--color-text-secondary-dark)">
                  {fmt(startH, startM)}
                </td>
                <td className="px-4 py-3 border text-sm border-(--color-border-mid) text-(--color-text-secondary-dark)">
                  {fmt(endH, endM)}
                </td>
                <td className="px-4 py-3 border text-sm border-(--color-border-mid) text-(--color-text-secondary-dark)">
                  —
                </td>
                <td className="px-4 py-3 border text-sm font-semibold border-(--color-border-mid) text-(--color-text-primary-dark)">
                  {s.status}
                </td>
                <td className="px-4 py-3 border border-(--color-border-mid)">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      title="Edit"
                      aria-label="Edit showtime"
                      onClick={() => onEdit(s)}
                      className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-(--color-pill-idle-bg-hover)"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-(--color-text-secondary-dark) group-hover:text-(--color-topbar-dark-text)"
                      >
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      aria-label="Delete showtime"
                      onClick={() => onDelete(s.id)}
                      className="group inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-(--color-danger-bg-hover)"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        className="text-(--color-text-secondary-dark) group-hover:text-(--color-danger-icon-hover)"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
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
                className="px-4 py-10 text-center text-sm text-(--color-text-disabled-dark)"
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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto bg-(--color-surface-panel) p-5">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Theater selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold whitespace-nowrap text-(--color-text-primary-dark)">
            Select Theater
          </span>
          <div className="relative">
            <button
              onClick={() => setTheaterOpen((o) => !o)}
              className="flex items-center gap-2 rounded px-4 py-1.5 text-sm min-w-[130px] justify-between bg-(--color-border-dark) border border-(--color-input-border) text-(--color-text-primary-dark)"
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
                className="text-(--color-text-secondary-dark)"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {theaterOpen && (
              <div className="absolute top-full left-0 mt-1 rounded shadow-lg z-20 min-w-full bg-(--color-border-dark) border border-(--color-input-border)">
                {THEATERS.map((t) => (
                  <div
                    key={t}
                    onClick={() => {
                      setSelectedTheater(t);
                      setTheaterOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-(--color-pill-idle-bg-hover)
                      ${t === selectedTheater ? "font-semibold text-(--color-topbar-dark-text)" : "text-(--color-text-primary-dark)"}`}
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
          className="rounded px-3 py-1.5 text-sm outline-none transition bg-(--color-input-bg) border border-(--color-input-border) text-(--color-input-text) focus:border-(--color-input-border-focus)"
          placeholder="Select Date"
        />

        <div className="flex-1" />

        {/* Add showtime */}
        <button
          type="button"
          onClick={openAddShowtime}
          className="text-sm font-semibold px-4 py-1.5 rounded transition-colors whitespace-nowrap bg-(--color-btn-primary-bg) hover:bg-(--color-btn-primary-bg-hover) text-(--color-btn-primary-text)"
        >
          + Add Showtime
        </button>
      </div>

      {/* Theater schedule (timeline) — flex-shrink-0 so it keeps full height */}
      <div className="shrink-0">
        <TimelineGrid showtimes={showtimes} onEditShowtime={openEditShowtime} />
      </div>

      {/* Detail table — full natural height; scroll the page, not a fixed table pane */}
      <div className="shrink-0">
        <ShowtimesTable
          showtimes={showtimes}
          onDelete={handleDelete}
          onEdit={openEditShowtime}
        />
      </div>

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
