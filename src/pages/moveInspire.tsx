import { useState, type ChangeEvent } from "react";
import { DEFAULT_POSTER_URL, MOVIES } from "../store/tempMoiveData";
import MovieFormModal from "../components/editModal/MovieFormModal";

const ITEMS_PER_PAGE = 4;

type MovieListItem = (typeof MOVIES)[number] & {
  description?: string;
  releaseDate?: string;
  poster?: File | null;
};

const TABLE_HEADER_BG = "bg-[#000000]";
const TABLE_ROW_BG = "bg-[#333739]";
/** Outer frame only — interior lines use single edges so they are not doubled */
const TABLE_OUTER = "border-2 border-[#000000]";
const rowHover =
  "transition-colors hover:bg-[color-mix(in_srgb,#ffffff_10%,#333739)]";

/** Same 2px weight as outer frame; only right/bottom edges so shared lines are not doubled. */
function headerCellBorder(colIndex: number) {
  return `border-b-2 border-[#000000] ${colIndex < 5 ? "border-r-2 border-[#000000]" : ""}`;
}

function bodyCellBorder(colIndex: number, rowIndex: number) {
  const isLastRow = rowIndex >= ITEMS_PER_PAGE - 1;
  return `${colIndex < 5 ? "border-r-2 border-[#000000] " : ""}${!isLastRow ? "border-b-2 border-[#000000]" : ""}`.trim();
}

/** Matches header + body cells (poster column fixed ~12rem) */
const GRID_COLS =
  "grid [grid-template-columns:minmax(12rem,12rem)_minmax(8rem,2fr)_minmax(6rem,1fr)_minmax(6rem,1fr)_minmax(5rem,1fr)_minmax(8rem,10rem)]";

/** Row poster: same footprint as moveInspire (w-24 column / h-20 thumb) */
function MoviePosterThumb({
  posterUrl,
  title,
}: {
  posterUrl?: string;
  title: string;
}) {
  if (posterUrl) {
    return (
      <div className="group/poster relative aspect-2/3 h-28 overflow-hidden rounded-md border border-(--color-input-border) shadow-lg ring-1 ring-black/30">
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover/poster:scale-110"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
      </div>
    );
  }
  return (
    <div className="relative flex aspect-2/3 h-20 items-center justify-center overflow-hidden rounded-md border border-(--color-input-border) bg-(--color-border-dark)">
      <svg
        width="24"
        height="24"
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
  );
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "Active";
  return (
    <span
      className={`inline-flex h-fit shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-tight whitespace-nowrap ${
        isActive
          ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
          : "bg-(--color-border-dark) text-(--color-text-secondary-dark) ring-1 ring-(--color-input-border)"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? "animate-pulse bg-emerald-400" : "bg-(--color-text-muted-dark)"}`}
      />
      {status}
    </span>
  );
}

function IconBtn({
  onClick,
  variant = "default",
  children,
  label,
}: {
  onClick: () => void;
  variant?: "default" | "danger" | "primary";
  children: React.ReactNode;
  label: string;
}) {
  const styles = {
    default:
      "border-(--color-input-border) bg-(--color-border-dark)/40 text-(--color-text-secondary-dark) hover:border-(--color-btn-primary-bg-hover)/40 hover:bg-(--color-border-dark) hover:text-(--color-btn-primary-bg-hover)",
    primary:
      "border-(--color-btn-primary-bg)/30 bg-(--color-btn-primary-bg)/10 text-(--color-btn-primary-bg) hover:bg-(--color-btn-primary-bg)/20",
    danger:
      "border-(--color-input-border) bg-(--color-border-dark)/40 text-(--color-text-secondary-dark) hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`group/btn flex h-9 w-9 items-center justify-center rounded-md border transition-all hover:scale-105 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

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
    <div className="flex items-center justify-end gap-1.5">
      <IconBtn onClick={onEdit} variant="primary" label="Edit">
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </IconBtn>
      <IconBtn onClick={onSchedule} label="Schedule Showtimes">
        <svg
          width="15"
          height="15"
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
      </IconBtn>
      <IconBtn onClick={onDelete} variant="danger" label="Delete">
        <svg
          width="15"
          height="15"
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
      </IconBtn>
    </div>
  );
}

function Pagination({
  current,
  total,
  onChange,
}: {
  current: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const navBtn =
    "flex h-8 w-8 items-center justify-center rounded border border-(--color-page-btn-border) text-(--color-page-btn-text) transition-colors hover:bg-(--color-page-btn-bg-hover) disabled:cursor-not-allowed disabled:opacity-30";
  const pageNumIdle =
    "flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors border-(--color-page-btn-border) text-(--color-page-btn-text) hover:bg-(--color-page-btn-bg-hover)";
  const pageNumActive =
    "flex h-8 w-8 items-center justify-center rounded border text-sm font-medium transition-colors border-(--color-page-active-border) bg-(--color-page-active-bg) text-(--color-page-active-text) hover:bg-(--color-page-active-bg)";

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {[
        {
          icon: (
            <>
              <polyline points="11 17 6 12 11 7" />
              <polyline points="18 17 13 12 18 7" />
            </>
          ),
          action: () => onChange(1),
          disabled: current === 1,
        },
        {
          icon: <polyline points="15 18 9 12 15 6" />,
          action: () => onChange(current - 1),
          disabled: current === 1,
        },
      ].map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={btn.action}
          disabled={btn.disabled}
          className={navBtn}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {btn.icon}
          </svg>
        </button>
      ))}

      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={p === current ? pageNumActive : pageNumIdle}
        >
          {p}
        </button>
      ))}

      {total > 3 && (
        <span className="px-1 text-(--color-text-muted-dark)">...</span>
      )}

      {[
        {
          icon: <polyline points="9 18 15 12 9 6" />,
          action: () => onChange(current + 1),
          disabled: current === total,
        },
        {
          icon: (
            <>
              <polyline points="13 17 18 12 13 7" />
              <polyline points="6 17 11 12 6 7" />
            </>
          ),
          action: () => onChange(total),
          disabled: current === total,
        },
      ].map((btn, i) => (
        <button
          key={i}
          type="button"
          onClick={btn.action}
          disabled={btn.disabled}
          className={navBtn}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            {btn.icon}
          </svg>
        </button>
      ))}
    </div>
  );
}

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

  const rowSlots: (MovieListItem | null)[] =
    paginated.length === 0
      ? []
      : (() => {
          const pad = Math.max(0, ITEMS_PER_PAGE - paginated.length);
          return [
            ...paginated,
            ...Array.from({ length: pad }, () => null),
          ] as (MovieListItem | null)[];
        })();

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const control =
    "rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";

  return (
    <div className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-(--color-surface-panel)">
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-4">
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
                  onChange={handleSearch}
                  className="w-48 border-none bg-transparent text-sm text-(--color-input-text) placeholder:text-(--color-input-placeholder) outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
                  Show Status
                </span>
                <select
                  value={statusFilter}
                  onChange={handleStatus}
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

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-auto px-5 pb-2">
            <div
              className={`flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${TABLE_OUTER}`}
            >
              <div className={`${GRID_COLS} ${TABLE_HEADER_BG} shrink-0`}>
                {(
                  [
                    ["Poster", "min-w-[12rem] w-48"],
                    ["Movie Title", ""],
                    ["Genre", ""],
                    ["Duration(min)", ""],
                    ["Status", ""],
                    ["Actions", ""],
                  ] as const
                ).map(([h, w], colIndex) => (
                  <div
                    key={h}
                    className={`${headerCellBorder(colIndex)} px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-(--color-text-primary-dark) ${w}`}
                  >
                    {h}
                  </div>
                ))}
              </div>

              {paginated.length === 0 ? (
                <div
                  className={`flex min-h-40 flex-1 items-center justify-center ${TABLE_ROW_BG} text-sm text-(--color-text-muted-dark)`}
                >
                  No movies found.
                </div>
              ) : (
                <div className="grid min-h-0 flex-1 grid-rows-4">
                  {rowSlots.map((movie, rowIndex) => (
                    <div
                      key={movie?.id ?? `empty-${rowIndex}`}
                      className={`group ${GRID_COLS} min-h-0 ${TABLE_ROW_BG} ${rowHover}`}
                    >
                      {movie ? (
                        <>
                          <div
                            className={`${bodyCellBorder(0, rowIndex)} flex min-h-0 items-center justify-start px-5 py-3`}
                          >
                            <MoviePosterThumb
                              posterUrl={movie.posterUrl}
                              title={movie.title}
                            />
                          </div>
                          <div
                            className={`${bodyCellBorder(1, rowIndex)} flex min-h-0 flex-col justify-center px-3 py-3`}
                          >
                            <div className="font-semibold text-(--color-text-primary-dark) transition-colors group-hover:text-(--color-btn-primary-bg-hover)">
                              {movie.title}
                            </div>
                            {movie.releaseDate ? (
                              <div className="mt-0.5 text-xs text-(--color-text-muted-dark)">
                                Released {movie.releaseDate}
                              </div>
                            ) : null}
                          </div>
                          <div
                            className={`${bodyCellBorder(2, rowIndex)} flex min-h-0 items-center px-3 py-3`}
                          >
                            <span className="inline-flex shrink-0 rounded-md bg-(--color-border-dark)/60 px-2 py-1 text-xs leading-tight text-(--color-text-secondary-dark) ring-1 ring-(--color-input-border)">
                              {movie.genre}
                            </span>
                          </div>
                          <div
                            className={`${bodyCellBorder(3, rowIndex)} flex min-h-0 items-center justify-center px-3 py-3 text-center text-sm tabular-nums text-(--color-text-secondary-dark)`}
                          >
                            <span className="font-semibold text-(--color-text-primary-dark)">
                              {movie.duration}
                            </span>
                            <span className="ml-1 text-xs">min</span>
                          </div>
                          <div
                            className={`${bodyCellBorder(4, rowIndex)} flex min-h-0 items-center justify-center px-3 py-3`}
                          >
                            <StatusBadge status={movie.status} />
                          </div>
                          <div
                            className={`${bodyCellBorder(5, rowIndex)} flex min-h-0 items-center justify-end px-5 py-3`}
                          >
                            <ActionButtons
                              onEdit={() => openEditMovie(movie)}
                              onSchedule={() =>
                                console.log("Schedule", movie.id)
                              }
                              onDelete={() => console.log("Delete", movie.id)}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div
                            className={`${bodyCellBorder(0, rowIndex)} flex min-h-0 items-center px-5 py-3`}
                          />
                          <div
                            className={`${bodyCellBorder(1, rowIndex)} flex min-h-0 items-center px-3 py-3`}
                          />
                          <div
                            className={`${bodyCellBorder(2, rowIndex)} flex min-h-0 items-center px-3 py-3`}
                          />
                          <div
                            className={`${bodyCellBorder(3, rowIndex)} flex min-h-0 items-center justify-center px-3 py-3`}
                          />
                          <div
                            className={`${bodyCellBorder(4, rowIndex)} flex min-h-0 items-center justify-center px-3 py-3`}
                          />
                          <div
                            className={`${bodyCellBorder(5, rowIndex)} flex min-h-0 items-center justify-end px-5 py-3`}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
