import { useState } from "react";
import { MOVIES } from "../store/tempMoiveData";
import MovieFormModal from "../components/editModal/MovieFormModal";

const ITEMS_PER_PAGE = 6;

function PosterPlaceholder() {
  return (
    <div className="w-14 h-16 border-2 border-neutral-500 bg-neutral-600 relative shrink-0 rounded-sm overflow-hidden">
      <svg viewBox="0 0 56 64" className="absolute inset-0 w-full h-full">
        <line x1="0" y1="0" x2="56" y2="64" stroke="#888" strokeWidth="1.5" />
        <line x1="56" y1="0" x2="0" y2="64" stroke="#888" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`text-sm font-semibold ${status === "Active" ? "text-white" : "text-neutral-300"}`}
    >
      {status}
    </span>
  );
}

function ActionButtons({ onEdit, onSchedule, onDelete }) {
  return (
    <div className="flex items-center gap-1">
      {/* Edit */}
      <button
        onClick={onEdit}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-neutral-600 transition-colors group"
      >
        <svg
          width="14"
          height="14"
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

      {/* Schedule Showtimes */}
      <button
        onClick={onSchedule}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-neutral-600 transition-colors group"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-neutral-300 group-hover:text-white"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-[10px] text-neutral-400 group-hover:text-neutral-200 text-center leading-tight">
          Schedule
          <br />
          Showtimes
        </span>
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="flex flex-col items-center gap-0.5 px-2 py-1 rounded hover:bg-red-900/40 transition-colors group"
      >
        <svg
          width="14"
          height="14"
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
  );
}

function Pagination({ current, total, onChange }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-1 py-4">
      {/* First */}
      <button
        onClick={() => onChange(1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <polyline points="11 17 6 12 11 7" />
          <polyline points="18 17 13 12 18 7" />
        </svg>
      </button>
      {/* Prev */}
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors
            ${
              p === current
                ? "bg-neutral-200 text-neutral-900 border-neutral-200"
                : "border-neutral-500 text-neutral-300 hover:bg-neutral-600"
            }`}
        >
          {p}
        </button>
      ))}

      {total > pages.length && (
        <span className="text-neutral-400 px-1">...</span>
      )}

      {/* Next */}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
      {/* Last */}
      <button
        onClick={() => onChange(total)}
        disabled={current === total}
        className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <polyline points="13 17 18 12 13 7" />
          <polyline points="6 17 11 12 6 7" />
        </svg>
      </button>
    </div>
  );
}

export default function MovieManagementPage() {
  const [movies, setMovies] = useState(MOVIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [movieModalOpen, setMovieModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  const openAddMovie = () => {
    setEditingMovie(null);
    setMovieModalOpen(true);
  };

  const openEditMovie = (movie) => {
    setEditingMovie(movie);
    setMovieModalOpen(true);
  };

  const closeMovieModal = () => {
    setMovieModalOpen(false);
    setEditingMovie(null);
  };

  const handleSaveMovie = (form) => {
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleStatus = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div>
      <div className="flex flex-1 overflow-hidden min-w-0">
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-neutral-800">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 gap-3 shrink-0">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="flex items-center gap-2 bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#aaa"
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
                  className="bg-transparent border-none outline-none text-sm text-neutral-200 placeholder-neutral-400 w-48"
                />
              </div>
              {/* Status filter */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-300 whitespace-nowrap">
                  Show Status
                </span>
                <select
                  value={statusFilter}
                  onChange={handleStatus}
                  className="bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5 text-sm text-neutral-200 outline-none cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            {/* Add button */}
            <button
              type="button"
              onClick={openAddMovie}
              className="bg-neutral-100 hover:bg-white text-neutral-900 text-sm font-semibold px-4 py-1.5 rounded transition-colors whitespace-nowrap"
            >
              Add New Movie
            </button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto px-5 pb-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-neutral-700">
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
                      className="px-4 py-3 text-left text-sm font-semibold text-neutral-200 border border-neutral-600 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((movie) => (
                  <tr
                    key={movie.id}
                    className="border-b border-neutral-700 hover:bg-neutral-700/40 transition-colors"
                  >
                    <td className="px-4 py-3 border border-neutral-700">
                      <PosterPlaceholder />
                    </td>
                    <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-200 font-medium">
                      {movie.title}
                    </td>
                    <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300">
                      {movie.genre}
                    </td>
                    <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300">
                      {movie.duration}
                    </td>
                    <td className="px-4 py-3 border border-neutral-700">
                      <StatusBadge status={movie.status} />
                    </td>
                    <td className="px-4 py-3 border border-neutral-700">
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
                      className="px-4 py-12 text-center text-neutral-400 text-sm"
                    >
                      No movies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
