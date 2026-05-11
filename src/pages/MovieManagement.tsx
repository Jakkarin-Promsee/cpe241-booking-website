import { useEffect, useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMovieStore,
  type Movie,
  type MovieFormData,
} from "../store/useMovieStore";
import MovieFormModal from "../components/editModal/MovieFormModal";

const ITEMS_PER_PAGE = 4;
type EffectiveMovieStatus = "Upcoming" | "Open" | "Ended" | "Hidden";
const MOVIE_STATUS_FILTERS: EffectiveMovieStatus[] = [
  "Upcoming",
  "Open",
  "Ended",
  "Hidden",
];

function normalizeDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  // MySQL responses may be "YYYY-MM-DD" or full datetime/ISO strings.
  // Use only the date part to keep lifecycle checks stable.
  const datePart = value.slice(0, 10);
  const parts = datePart.split("-");
  if (parts.length !== 3) return null;
  const [yearStr, monthStr, dayStr] = parts;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    return null;
  }
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getEffectiveStatus(movie: Movie): EffectiveMovieStatus {
  if (movie.hiden) return "Hidden";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const release = normalizeDate(movie.release_date);
  const end = normalizeDate(movie.end_date);

  if (release && today < release) return "Upcoming";
  if (end && today > end) return "Ended";
  return "Open";
}

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const toneClass =
    status === "Open"
      ? "bg-emerald-500/18 text-emerald-400 border border-emerald-500/30"
      : status === "Upcoming"
        ? "bg-amber-500/18 text-amber-300 border border-amber-500/30"
        : status === "Ended"
          ? "bg-sky-500/18 text-sky-300 border border-sky-500/30"
          : "bg-white/8 text-white/50 border border-white/12";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest w-fit ${toneClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "Open"
            ? "bg-emerald-400 animate-pulse"
            : status === "Upcoming"
              ? "bg-amber-300"
              : status === "Ended"
                ? "bg-sky-300"
                : "bg-white/40"
        }`}
      />
      {status}
    </span>
  );
}

// ─── Action Buttons (hover reveal) ───────────────────────────────────────────

function ActionButtons({
  onEdit,
  onSchedule,
  onSetOpen,
  onSetHidden,
  onDelete,
}: {
  onEdit: () => void;
  onSchedule: () => void;
  onSetOpen: () => void;
  onSetHidden: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="absolute top-2 right-2 z-10 flex flex-col gap-1.5 rounded-lg bg-black/55 p-1.5 shadow-xl ring-1 ring-white/25 backdrop-blur-md opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Edit */}
      <button
        type="button"
        title="Edit"
        onClick={onEdit}
        className="h-9 w-9 rounded-full flex items-center justify-center bg-white text-zinc-900 shadow-md ring-1 ring-black/10 hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
      {/* Schedule */}
      <button
        type="button"
        title="Schedule Showtimes"
        onClick={onSchedule}
        className="h-9 w-9 rounded-full flex items-center justify-center bg-amber-400 text-amber-950 shadow-md ring-1 ring-amber-300/80 hover:bg-amber-300 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>
      {/* Delete */}
      <button
        type="button"
        title="Delete"
        onClick={onDelete}
        className="h-9 w-9 rounded-full flex items-center justify-center bg-red-600 text-white shadow-md ring-1 ring-red-400/60 hover:bg-red-500 hover:scale-105 active:scale-95 transition-transform"
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>
      {/* Quick Open */}
      <button
        type="button"
        title="Set Open"
        onClick={onSetOpen}
        className="h-8 rounded-md px-2 text-[10px] font-semibold bg-emerald-500 text-white shadow-md ring-1 ring-emerald-300/60 hover:bg-emerald-400 transition-colors"
      >
        OPEN
      </button>
      {/* Quick Hidden */}
      <button
        type="button"
        title="Set Hidden"
        onClick={onSetHidden}
        className="h-8 rounded-md px-2 text-[10px] font-semibold bg-zinc-700 text-zinc-200 shadow-md ring-1 ring-zinc-500/60 hover:bg-zinc-600 transition-colors"
      >
        HIDE
      </button>
    </div>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────

function MovieCard({
  movie,
  onEdit,
  onSchedule,
  onSetOpen,
  onSetHidden,
  onDelete,
}: {
  movie: Movie;
  onEdit: () => void;
  onSchedule: () => void;
  onSetOpen: () => void;
  onSetHidden: () => void;
  onDelete: () => void;
}) {
  const effectiveStatus = getEffectiveStatus(movie);

  return (
    <div className="group relative flex flex-col rounded-xl border border-(--color-input-border)/50 bg-(--color-border-dark) overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-input-border)">
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden bg-(--color-border-dark)">
        {movie.poster_url ? (
          <img
            src={movie.poster_url}
            alt={movie.showtime_title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-350 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-(--color-border-dark)">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-(--color-text-muted-dark)"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Gradient overlay with title + status */}
        <div className="absolute inset-0 bg-linear-to-t from-black/82 via-black/20 to-transparent flex flex-col justify-end p-3 gap-1">
          <StatusBadge status={effectiveStatus} />
          <p
            className="font-bold text-white text-sm leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {movie.showtime_title}
          </p>
          {movie.release_date && (
            <p className="text-[11px] text-white/55">
              {movie.release_date}
              {movie.end_date ? ` - ${movie.end_date}` : ""}
            </p>
          )}
        </div>

        {/* Hover action buttons */}
        <ActionButtons
          onEdit={onEdit}
          onSchedule={onSchedule}
          onSetOpen={onSetOpen}
          onSetHidden={onSetHidden}
          onDelete={onDelete}
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <span className="inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full bg-(--color-border-dark)/60 border border-(--color-input-border) text-(--color-text-secondary-dark) w-fit">
          {movie.genre ?? "—"}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-(--color-text-secondary-dark)">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-(--color-text-muted-dark)"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-semibold text-sm text-(--color-text-primary-dark)">
            {movie.duration}
          </span>
          <span>min</span>
        </div>
      </div>
    </div>
  );
}

// ─── Empty Card Slot ─────────────────────────────────────────────────────────

function EmptyCard() {
  return (
    <div className="rounded-xl border border-dashed border-(--color-input-border)/30 aspect-2/3" />
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const base =
    "flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors";
  const idle = `${base} border-(--color-page-btn-border) text-(--color-page-btn-text) hover:bg-(--color-page-btn-bg-hover)`;
  const active = `${base} border-(--color-page-active-border) bg-(--color-page-active-bg) text-(--color-page-active-text)`;
  const nav = `${base} border-(--color-page-btn-border) text-(--color-page-btn-text) hover:bg-(--color-page-btn-bg-hover) disabled:opacity-30 disabled:cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1 py-5">
      <button
        type="button"
        className={nav}
        disabled={current === 1}
        onClick={() => onChange(1)}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>
      <button
        type="button"
        className={nav}
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          className={p === current ? active : idle}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className={nav}
        disabled={current === total}
        onClick={() => onChange(current + 1)}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      <button
        type="button"
        className={nav}
        disabled={current === total}
        onClick={() => onChange(total)}
      >
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MovieManagementPage() {
  const navigate = useNavigate();
  const {
    movies,
    loading,
    error,
    fetchMovies,
    createMovie,
    updateMovie,
    deleteMovie,
  } = useMovieStore();

  const [search, setSearch] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<
    Set<EffectiveMovieStatus>
  >(() => new Set());
  const [page, setPage] = useState(1);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);

  useEffect(() => {
    void fetchMovies();
  }, []);

  const openAddMovie = () => {
    setEditingMovie(null);
    setMovieModalOpen(true);
  };

  const openEditMovie = (movie: Movie) => {
    setEditingMovie(movie);
    setMovieModalOpen(true);
  };

  const closeMovieModal = () => {
    setMovieModalOpen(false);
    setEditingMovie(null);
  };

  const handleSaveMovie = (form: {
    title: string;
    genre: string;
    duration: string | number;
    description: string;
    releaseDate: string;
    endDate: string;
    hiden: boolean;
  }) => {
    const durationNum = Number(form.duration);
    const data: MovieFormData = {
      title: form.title,
      genre: form.genre || undefined,
      duration: Number.isFinite(durationNum) ? durationNum : 0,
      description: form.description || undefined,
      releaseDate: form.releaseDate || undefined,
      endDate: form.endDate || undefined,
      status: form.hiden ? "Hidden" : "Open",
      hiden: form.hiden,
    };
    if (editingMovie) {
      void updateMovie(editingMovie.show_id, data).then(() => fetchMovies());
    } else {
      void createMovie(data).then(() => fetchMovies());
    }
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Delete this movie? This cannot be undone.")) return;
    void deleteMovie(id);
  };

  const handleQuickStatus = (movie: Movie, status: "Open" | "Hidden") => {
    if ((status === "Hidden" && movie.hiden) || (status === "Open" && !movie.hiden)) {
      return;
    }
    const payload: MovieFormData = {
      title: movie.showtime_title,
      genre: movie.genre ?? undefined,
      duration: movie.duration,
      description: movie.showtime_descript ?? undefined,
      releaseDate: movie.release_date ?? undefined,
      endDate: movie.end_date ?? undefined,
      posterUrl: movie.poster_url ?? undefined,
      status,
      hiden: status === "Hidden",
    };
    void updateMovie(movie.show_id, payload).then(() => fetchMovies());
  };

  const toggleStatus = (status: EffectiveMovieStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
    setPage(1);
  };

  const filtered = movies.filter((m) => {
    const matchSearch =
      m.showtime_title.toLowerCase().includes(search.toLowerCase()) ||
      (m.genre ?? "").toLowerCase().includes(search.toLowerCase());
    const effectiveStatus = getEffectiveStatus(m);
    const matchStatus =
      selectedStatuses.size === 0 || selectedStatuses.has(effectiveStatus);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const emptySlots = Math.max(0, ITEMS_PER_PAGE - paginated.length);

  const control =
    "rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-(--color-surface-panel)">
          {/* ── Error banner ── */}
          {error && (
            <div className="mx-5 mt-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className={`flex items-center gap-2 ${control}`}>
                <svg
                  className="shrink-0 text-(--color-input-placeholder)"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Search"
                  value={search}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-48 border-none bg-transparent text-sm text-(--color-input-text) placeholder:text-(--color-input-placeholder) outline-none"
                />
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
                  Show Status
                </span>
                <div className="flex gap-1">
                  {MOVIE_STATUS_FILTERS.map((status) => {
                    const active = selectedStatuses.has(status);
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleStatus(status)}
                        aria-pressed={active}
                        className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                          active
                            ? "bg-(--color-pill-active-bg) text-(--color-pill-active-text)"
                            : "bg-(--color-pill-idle-bg) text-(--color-pill-idle-text) hover:bg-(--color-pill-idle-bg-hover)"
                        }`}
                      >
                        {status.toLowerCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAddMovie}
              className="whitespace-nowrap rounded bg-(--color-btn-primary-bg) px-4 py-1.5 text-sm font-semibold text-(--color-btn-primary-text) transition-colors hover:bg-(--color-btn-primary-bg-hover)"
            >
              Add New Movie
            </button>
          </div>

          {/* ── Movie count ── */}
          <div className="px-5 pb-1 text-xs uppercase tracking-widest text-(--color-text-muted-dark)">
            {filtered.length} movie{filtered.length !== 1 ? "s" : ""}
          </div>

          {/* ── Card Grid ── */}
          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-2">
            {loading ? (
              <div className="grid grid-cols-4 gap-3.5">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-(--color-input-border)/50 bg-(--color-border-dark) aspect-2/3 animate-pulse"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-(--color-text-muted-dark)">
                No movies found.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3.5">
                {paginated.map((movie) => (
                  <MovieCard
                    key={movie.show_id}
                    movie={movie}
                    onEdit={() => openEditMovie(movie)}
                    onSchedule={() =>
                      navigate("/admin/screens", {
                        state: {
                          openCreateModal: true,
                          prefillMovieTitle: movie.showtime_title,
                        },
                      })
                    }
                    onSetOpen={() => handleQuickStatus(movie, "Open")}
                    onSetHidden={() => handleQuickStatus(movie, "Hidden")}
                    onDelete={() => handleDelete(movie.show_id)}
                  />
                ))}
                {Array.from({ length: emptySlots }).map((_, i) => (
                  <EmptyCard key={`empty-${i}`} />
                ))}
              </div>
            )}
          </div>

          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>

      <MovieFormModal
        key={editingMovie?.show_id ?? "new-movie"}
        isOpen={movieModalOpen}
        onClose={closeMovieModal}
        onSave={handleSaveMovie}
        initialData={
          editingMovie
            ? {
                title: editingMovie.showtime_title,
                genre: editingMovie.genre ?? "",
                duration: editingMovie.duration,
                description: editingMovie.showtime_descript ?? "",
                releaseDate: editingMovie.release_date ?? "",
                endDate: editingMovie.end_date ?? "",
                hiden: editingMovie.hiden,
                poster: null,
              }
            : null
        }
      />
    </div>
  );
}
