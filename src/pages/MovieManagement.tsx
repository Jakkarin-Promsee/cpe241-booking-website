import { useState, type ChangeEvent } from "react";
import { DEFAULT_POSTER_URL, MOVIES } from "../store/tempMoiveData";
import MovieFormModal from "../components/editModal/MovieFormModal";

const ITEMS_PER_PAGE = 4;

type MovieListItem = (typeof MOVIES)[number] & {
  description?: string;
  releaseDate?: string;
  poster?: File | null;
};

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest w-fit ${
        isActive
          ? "bg-emerald-500/18 text-emerald-400 border border-emerald-500/30"
          : "bg-white/8 text-white/50 border border-white/12"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-emerald-400 animate-pulse" : "bg-white/40"
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
  onDelete,
}: {
  onEdit: () => void;
  onSchedule: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 translate-x-1.5 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Edit */}
      <button
        type="button"
        title="Edit"
        onClick={onEdit}
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 text-white hover:scale-110 transition-transform backdrop-blur-sm"
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
        className="w-8 h-8 rounded-full flex items-center justify-center bg-white/12 text-white hover:scale-110 transition-transform backdrop-blur-sm"
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
        className="w-8 h-8 rounded-full flex items-center justify-center bg-red-500/22 text-red-400 hover:scale-110 transition-transform backdrop-blur-sm"
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
    </div>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────

function MovieCard({
  movie,
  onEdit,
  onSchedule,
  onDelete,
}: {
  movie: MovieListItem;
  onEdit: () => void;
  onSchedule: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group relative flex flex-col rounded-xl border border-(--color-input-border)/50 bg-(--color-border-dark) overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-(--color-input-border)">
      {/* Poster */}
      <div className="relative aspect-2/3 overflow-hidden bg-(--color-border-dark)">
        {movie.posterUrl ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
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
          <StatusBadge status={movie.status} />
          <p
            className="font-bold text-white text-sm leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {movie.title}
          </p>
          {movie.releaseDate && (
            <p className="text-[11px] text-white/55">{movie.releaseDate}</p>
          )}
        </div>

        {/* Hover action buttons */}
        <ActionButtons
          onEdit={onEdit}
          onSchedule={onSchedule}
          onDelete={onDelete}
        />
      </div>

      {/* Card body */}
      <div className="flex flex-col gap-2 px-3 py-2.5">
        <span className="inline-flex text-[11px] font-medium px-2.5 py-1 rounded-full bg-(--color-border-dark)/60 border border-(--color-input-border) text-(--color-text-secondary-dark) w-fit">
          {movie.genre}
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
      {/* First / Prev */}
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

      {/* Page numbers */}
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

      {/* Next / Last */}
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
  const [movies, setMovies] = useState<MovieListItem[]>(MOVIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieListItem | null>(null);

  const openAddMovie = () => {
    setEditingMovie(null);
    setMovieModalOpen(true);
  };

  const openEditMovie = (movie: MovieListItem) => {
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
  }) => {
    const durationNum = Number(form.duration);
    if (editingMovie) {
      setMovies((prev) =>
        prev.map((m) =>
          m.id === editingMovie.id
            ? {
                ...m,
                title: form.title,
                genre: form.genre,
                duration: Number.isFinite(durationNum)
                  ? durationNum
                  : m.duration,
                description: form.description,
                releaseDate: form.releaseDate,
              }
            : m,
        ),
      );
    } else {
      setMovies((prev) => {
        const nextId = Math.max(0, ...prev.map((m) => m.id)) + 1;
        return [
          ...prev,
          {
            id: nextId,
            title: form.title,
            genre: form.genre,
            duration: Number.isFinite(durationNum) ? durationNum : 0,
            status: "Active",
            description: form.description,
            releaseDate: form.releaseDate,
            posterUrl: DEFAULT_POSTER_URL,
          },
        ];
      });
    }
  };

  const filtered = movies.filter((m) => {
    const matchSearch =
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.genre.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || m.status === statusFilter;
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
                <select
                  value={statusFilter}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className={`cursor-pointer ${control}`}
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
            {filtered.length === 0 ? (
              <div className="flex min-h-40 items-center justify-center text-sm text-(--color-text-muted-dark)">
                No movies found.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3.5">
                {paginated.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onEdit={() => openEditMovie(movie)}
                    onSchedule={() => console.log("Schedule", movie.id)}
                    onDelete={() => console.log("Delete", movie.id)}
                  />
                ))}
                {/* Empty slots to keep the grid height stable */}
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
        key={editingMovie?.id ?? "new-movie"}
        isOpen={movieModalOpen}
        onClose={closeMovieModal}
        onSave={handleSaveMovie}
        initialData={
          editingMovie
            ? {
                title: editingMovie.title,
                genre: editingMovie.genre,
                duration: editingMovie.duration,
                description: editingMovie.description ?? "",
                releaseDate: editingMovie.releaseDate ?? "",
                poster: editingMovie.poster ?? null,
              }
            : null
        }
      />
    </div>
  );
}
