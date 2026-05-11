import { useEffect, useState } from "react";
import { useShowingStore, type Showing, type ShowingFormData } from "../store/useShowingStore";
import { useMovieStore } from "../store/useMovieStore";
import ScreenFormModal, {
  type ScreenFormState,
} from "../components/editModal/ScreenFormModal";

// ─── Local row type (adapted from Showing) ────────────────────────────────────

type ShowtimeRow = {
  id: number;
  showId: number;
  screen: string;
  movie: string;
  startHour: number;
  durationMin: number;
  status: string;
  language?: string;
  date?: string;
};

// ─── Palette key based on show_id ────────────────────────────────────────────

const PALETTE_KEYS = ["a", "b", "c", "d", "e", "f"] as const;
type PaletteKey = (typeof PALETTE_KEYS)[number];

function getPaletteKey(showId: number): PaletteKey {
  return PALETTE_KEYS[showId % PALETTE_KEYS.length];
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

function parseApiTime(t: string): number {
  const parts = t.split(":");
  const h = Number(parts[0]) || 0;
  const m = Number(parts[1]) || 0;
  return h + m / 60;
}

function showingToRow(s: Showing): ShowtimeRow {
  const startHour = parseApiTime(s.start_time);
  const endHour = parseApiTime(s.end_time);
  return {
    id: s.showing_id,
    showId: s.show_id,
    screen: s.venues_name,
    movie: s.movie_title,
    startHour,
    durationMin: Math.round((endHour - startHour) * 60),
    status: s.status,
    language: s.language ?? undefined,
    date: s.showtime_date,
  };
}

function hourToTimeStr(h: number): string {
  const hh = Math.floor(h);
  const mm = Math.round((h % 1) * 60);
  return `${String(hh).padStart(2, "0")}.${String(mm).padStart(2, "0")}`;
}

function parseTimeToHour(str: string): number {
  if (!str || typeof str !== "string") return 0;
  const normalized = str.trim().replace(":", ".");
  const parts = normalized.split(".");
  const h = Number(parts[0]) || 0;
  const m = parts.length > 1 ? Number(parts[1]) || 0 : 0;
  return h + m / 60;
}

function toApiTime(t: string): string {
  const normalized = t.trim().replace(".", ":");
  const parts = normalized.split(":");
  const h = String(Number(parts[0]) || 0).padStart(2, "0");
  const m = String(Number(parts[1]) || 0).padStart(2, "0");
  return `${h}:${m}:00`;
}

function showtimeToFormFields(s: ShowtimeRow): Partial<ScreenFormState> {
  const startTime = hourToTimeStr(s.startHour);
  const endHour = s.startHour + s.durationMin / 60;
  const endTime = hourToTimeStr(endHour);
  return {
    movie: s.movie,
    language: s.language ?? "TH/EN",
    format: "",
    screen: s.screen,
    date: s.date ?? "",
    selectedSlot: startTime,
    startTime,
    endTime,
    seatPlan: "Standard 150 seats",
    seatPrice: "Weekend price",
  };
}

// ─── Timeline layout constants ────────────────────────────────────────────────

const HOUR_START = 10;
const HOUR_END = 22;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);
const TOTAL_HOURS = HOUR_END - HOUR_START;
const LABEL_COL_WIDTH = 80;
const CELL_WIDTH = 95;
const TIMELINE_ROW_HEIGHT_PX = 88;

function toPercent(hour: number) {
  return ((hour - HOUR_START) / TOTAL_HOURS) * 100;
}

/** Local calendar date as YYYY-MM-DD for `<input type="date">`. */
function formatLocalDateYmd(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ─── ShowtimeBlock ────────────────────────────────────────────────────────────

function ShowtimeBlock({
  showtime,
  onEdit,
}: {
  showtime: ShowtimeRow;
  onEdit: (s: ShowtimeRow) => void;
}) {
  const leftPct = toPercent(showtime.startHour);
  const widthPct = (showtime.durationMin / 60 / TOTAL_HOURS) * 100;
  const paletteKey: PaletteKey = getPaletteKey(showtime.showId);

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

// ─── TimelineGrid ─────────────────────────────────────────────────────────────

function TimelineGrid({
  showtimes,
  screens,
  onEditShowtime,
  loading,
}: {
  showtimes: ShowtimeRow[];
  screens: string[];
  onEditShowtime: (s: ShowtimeRow) => void;
  loading: boolean;
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
        {loading ? (
          <div
            className="animate-pulse bg-(--color-surface-overlay)"
            style={{ height: TIMELINE_ROW_HEIGHT_PX }}
          />
        ) : (
          screens.map((screen) => {
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
                  {HOURS.map((h, i) => (
                    <div
                      key={h}
                      className="absolute top-0 bottom-0 border-l border-(--color-border-mid)"
                      style={{ left: `${(i / TOTAL_HOURS) * 100}%` }}
                    />
                  ))}
                  {rowShowtimes.map((s) => (
                    <ShowtimeBlock key={s.id} showtime={s} onEdit={onEditShowtime} />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ─── ShowtimesTable ───────────────────────────────────────────────────────────

function ShowtimesTable({
  showtimes,
  onDelete,
  onEdit,
  loading,
}: {
  showtimes: ShowtimeRow[];
  onDelete: (id: number) => void;
  onEdit: (s: ShowtimeRow) => void;
  loading: boolean;
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
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 6 }).map((__, j) => (
                  <td
                    key={j}
                    className="px-4 py-3 border border-(--color-border-mid)"
                  >
                    <div className="h-4 rounded animate-pulse bg-(--color-border-dark)" />
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <>
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
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ScreenManagementPage() {
  const {
    showings,
    venues,
    loading,
    error,
    fetchVenues,
    fetchShowings,
    createShowing,
    updateShowing,
    deleteShowing,
  } = useShowingStore();

  const { movies, fetchMovies } = useMovieStore();

  const [selectedTheater, setSelectedTheater] = useState("");
  const [theaterOpen, setTheaterOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatLocalDateYmd);
  const [showtimeModalOpen, setShowtimeModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeRow | null>(null);
  const [showtimeFormKey, setShowtimeFormKey] = useState(0);

  // Load venues and movies once on mount
  useEffect(() => {
    void fetchVenues();
    void fetchMovies();
  }, []);

  // Re-fetch showings when theater or date filter changes
  useEffect(() => {
    const venueObj = selectedTheater
      ? venues.find((v) => v.venues_name === selectedTheater)
      : undefined;
    void fetchShowings(venueObj?.venues_id, selectedDate || undefined);
  }, [selectedTheater, selectedDate]);

  const rows: ShowtimeRow[] = showings.map(showingToRow);
  const screenNames = venues.map((v) => v.venues_name);
  const movieTitles = movies.map((m) => m.showtime_title);

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
    const movie = movies.find((m) => m.showtime_title === form.movie);
    const venue = venues.find((v) => v.venues_name === form.screen);
    if (!movie || !venue) return;

    const data: ShowingFormData = {
      showId: movie.show_id,
      venueId: venue.venues_id,
      showtimeDate: form.date,
      startTime: toApiTime(form.startTime),
      endTime: toApiTime(form.endTime),
      language: form.language || undefined,
      seatPrice: form.seatPrice,
      status: editingShowtime?.status ?? "Ontime",
    };

    const refetch = () => {
      const venueObj = selectedTheater
        ? venues.find((v) => v.venues_name === selectedTheater)
        : undefined;
      void fetchShowings(venueObj?.venues_id, selectedDate || undefined);
    };

    if (editingShowtime) {
      void updateShowing(editingShowtime.id, data).then(refetch);
    } else {
      void createShowing(data).then(refetch);
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this showtime?")) return;
    void deleteShowing(id);
  };

  const selectedVenueName =
    selectedTheater || (venues[0]?.venues_name ?? "");

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto bg-(--color-surface-panel) p-5">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

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
              className="flex items-center gap-2 rounded px-4 py-1.5 text-sm min-w-[160px] justify-between bg-(--color-border-dark) border border-(--color-input-border) text-(--color-text-primary-dark)"
            >
              {selectedTheater || "All Venues"}
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
                <div
                  onClick={() => {
                    setSelectedTheater("");
                    setTheaterOpen(false);
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-(--color-pill-idle-bg-hover) ${
                    selectedTheater === ""
                      ? "font-semibold text-(--color-topbar-dark-text)"
                      : "text-(--color-text-primary-dark)"
                  }`}
                >
                  All Venues
                </div>
                {venues.map((v) => (
                  <div
                    key={v.venues_id}
                    onClick={() => {
                      setSelectedTheater(v.venues_name);
                      setTheaterOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer transition-colors hover:bg-(--color-pill-idle-bg-hover) ${
                      v.venues_name === selectedTheater
                        ? "font-semibold text-(--color-topbar-dark-text)"
                        : "text-(--color-text-primary-dark)"
                    }`}
                  >
                    {v.venues_name}
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

      {/* Theater schedule (timeline) */}
      <div className="shrink-0">
        <TimelineGrid
          showtimes={rows}
          screens={screenNames}
          onEditShowtime={openEditShowtime}
          loading={loading}
        />
      </div>

      {/* Detail table */}
      <div className="shrink-0">
        <ShowtimesTable
          showtimes={rows}
          onDelete={handleDelete}
          onEdit={openEditShowtime}
          loading={loading}
        />
      </div>

      <ScreenFormModal
        key={`${editingShowtime?.id ?? "new"}-${showtimeFormKey}`}
        isOpen={showtimeModalOpen}
        onClose={closeShowtimeModal}
        onSave={handleSaveShowtime}
        isEdit={!!editingShowtime}
        movies={movieTitles}
        screens={screenNames}
        initialData={
          editingShowtime
            ? showtimeToFormFields(editingShowtime)
            : {
                date: selectedDate || "",
                screen: selectedVenueName,
              }
        }
      />
    </div>
  );
}
