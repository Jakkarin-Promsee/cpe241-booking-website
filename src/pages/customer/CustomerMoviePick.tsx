import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { customerApi } from "@/lib/customerApi";
import type { Movie } from "@/store/useMovieStore";
import { normalizeMovie } from "@/store/useMovieStore";
import {
  isMovieAvailableForBooking,
  sortMoviesByAvailability,
} from "@/lib/customerBookingUi";

export default function CustomerMoviePick() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const rows = await customerApi.get<Array<Omit<Movie, "hiden"> & { hiden?: boolean }>>(
          "/api/movies",
        );
        if (!cancelled) setMovies(sortMoviesByAvailability(rows.map(normalizeMovie)));
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load movies");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-(--color-text-muted-dark) text-center py-16">Loading movies…</p>
    );
  }
  if (error) {
    return (
      <p className="text-center py-8 text-red-400 border border-(--color-border-dark) rounded-lg px-4">
        {error}
      </p>
    );
  }

  const available = movies.filter((m) => isMovieAvailableForBooking(m.status));
  const other = movies.filter((m) => !isMovieAvailableForBooking(m.status));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-black tracking-wide uppercase mb-1">Choose a movie</h1>
        <p className="text-sm text-(--color-text-muted-dark)">
          Available for booking first, then other titles.
        </p>
      </div>

      {available.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text-muted-dark) mb-3">
            Available now
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((m) => (
              <MovieCard key={m.show_id} movie={m} />
            ))}
          </ul>
        </section>
      )}

      {other.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text-muted-dark) mb-3">
            Other titles
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {other.map((m) => (
              <MovieCard key={m.show_id} movie={m} />
            ))}
          </ul>
        </section>
      )}

      {movies.length === 0 && (
        <p className="text-(--color-text-muted-dark) text-center py-12">No movies listed.</p>
      )}
    </div>
  );
}

function MovieCard({ movie }: { movie: Movie }) {
  const poster = movie.poster_url?.trim();
  return (
    <li>
      <Link
        to={`/booking/movies/${movie.show_id}/showtimes`}
        state={{ movieTitle: movie.showtime_title }}
        className="block rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel) overflow-hidden hover:border-(--color-input-border-focus) transition-colors"
      >
        <div className="aspect-2/3 bg-(--color-surface-overlay) flex items-center justify-center overflow-hidden">
          {poster ? (
            <img src={poster} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-(--color-text-disabled-dark) text-sm px-4 text-center">
              No poster
            </span>
          )}
        </div>
        <div className="p-3 border-t border-(--color-border-mid)">
          <p className="font-bold text-(--color-text-primary-dark) line-clamp-2">
            {movie.showtime_title}
          </p>
          <p className="text-xs text-(--color-text-muted-dark) mt-1">
            {movie.status}
            {movie.genre ? ` · ${movie.genre}` : ""}
          </p>
        </div>
      </Link>
    </li>
  );
}
