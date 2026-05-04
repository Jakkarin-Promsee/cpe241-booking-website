import { useState, type ChangeEvent } from "react";
import { MOVIES } from "../store/tempMoiveData";
import MovieFormModal from "../components/editModal/MovieFormModal";

const ITEMS_PER_PAGE = 6;

type MovieListItem = (typeof MOVIES)[number] & {
  description?: string;
  releaseDate?: string;
  poster?: File | null;
};

/** Tailwind + CSS variables from `index.css` (:root) — edit palette there only */
const rowHover =
  "transition-colors hover:bg-[color-mix(in_srgb,var(--color-surface-panel-mid)_30%,transparent)]";

function PosterPlaceholder() {
  return (
    <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm border-2 border-(--color-input-border) bg-(--color-border-dark)">
      <svg viewBox="0 0 56 64" className="absolute inset-0 h-full w-full">
        <line
          x1="0"
          y1="0"
          x2="56"
          y2="64"
          stroke="var(--color-chart-bar-top)"
          strokeWidth="1.5"
        />
        <line
          x1="56"
          y1="0"
          x2="0"
          y2="64"
          stroke="var(--color-chart-bar-top)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`text-sm font-semibold ${
        status === "Active"
          ? "text-(--color-sidebar-active-text)"
          : "text-(--color-text-secondary-dark)"
      }`}
    >
      {status}
    </span>
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
  const iconBtn =
    "group flex flex-col items-center gap-0.5 rounded px-2 py-1 transition-colors hover:bg-(--color-page-btn-bg-hover)";
  const iconStroke =
    "text-(--color-text-secondary-dark) group-hover:text-(--color-btn-primary-bg-hover)";
  const label =
    "text-[10px] text-(--color-text-muted-dark) group-hover:text-(--color-text-primary-dark)";

  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={onEdit} className={iconBtn}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={iconStroke}
        >
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
        <span className={label}>Edit</span>
      </button>

      <button type="button" onClick={onSchedule} className={iconBtn}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className={iconStroke}
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span
          className={`${label} text-center leading-tight`}
        >
          Schedule
          <br />
          Showtimes
        </span>
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="group flex flex-col items-center gap-0.5 rounded px-2 py-1 transition-colors hover:bg-(--color-danger-bg-hover)"
      >
        <svg
          width="14"
          height="14"
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
        <span className="text-[10px] text-(--color-text-muted-dark) group-hover:text-(--color-danger-text-hover)">
          Delete
        </span>
      </button>
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
  const [movies, setMovies] = useState(MOVIES);
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
    <div>
      <div className="flex min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-(--color-surface-panel)">
          <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-3">
            <div className="flex items-center gap-4">
              <div
                className={`flex items-center gap-2 ${control}`}
              >
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

          <div className="min-h-0 flex-1 overflow-auto px-5 pb-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--color-surface-panel-mid)">
                  {[
                    "Poster",
                    "Movie Title",
                    "Genre",
                    "Duration(min)",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="border border-(--color-border-dark) px-4 py-3 text-left text-sm font-semibold whitespace-nowrap text-(--color-text-primary-dark)"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((movie) => (
                  <tr key={movie.id} className={rowHover}>
                    <td className="border border-(--color-border-mid) px-4 py-3">
                      <PosterPlaceholder />
                    </td>
                    <td className="border border-(--color-border-mid) px-4 py-3 text-sm font-medium text-(--color-text-primary-dark)">
                      {movie.title}
                    </td>
                    <td className="border border-(--color-border-mid) px-4 py-3 text-sm text-(--color-text-secondary-dark)">
                      {movie.genre}
                    </td>
                    <td className="border border-(--color-border-mid) px-4 py-3 text-sm text-(--color-text-secondary-dark)">
                      {movie.duration}
                    </td>
                    <td className="border border-(--color-border-mid) px-4 py-3">
                      <StatusBadge status={movie.status} />
                    </td>
                    <td className="border border-(--color-border-mid) px-4 py-3">
                      <ActionButtons
                        onEdit={() => openEditMovie(movie)}
                        onSchedule={() => console.log("Schedule", movie.id)}
                        onDelete={() => console.log("Delete", movie.id)}
                      />
                    </td>
                  </tr>
                ))}

                {paginated.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-(--color-text-muted-dark)"
                    >
                      No movies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
