import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { customerApi } from "@/lib/customerApi";
import {
  isShowingBookable,
  sortShowingsByAvailability,
  type ShowingRow,
} from "@/lib/customerBookingUi";

type LocationState = { movieTitle?: string } | null;

export default function CustomerShowtimePick() {
  const { showId } = useParams<{ showId: string }>();
  const location = useLocation();
  const state = location.state as LocationState;
  const id = Number(showId);
  const [rows, setRows] = useState<ShowingRow[]>([]);
  const [title, setTitle] = useState<string>(state?.movieTitle ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Invalid movie");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const list = await customerApi.get<ShowingRow[]>(`/api/showings?showId=${id}`);
        if (!cancelled) {
          setRows(sortShowingsByAvailability(list));
          if (!state?.movieTitle && list[0]?.movie_title) {
            setTitle(list[0].movie_title);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load showtimes");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!Number.isInteger(id) || id <= 0) {
    return <p className="text-red-400">Invalid movie.</p>;
  }

  if (loading) {
    return <p className="text-(--color-text-muted-dark) text-center py-16">Loading showtimes…</p>;
  }
  if (error) {
    return (
      <p className="text-center py-8 text-red-400 border border-(--color-border-dark) rounded-lg">
        {error}
      </p>
    );
  }

  const avail = rows.filter(isShowingBookable);
  const rest = rows.filter((s) => !isShowingBookable(s));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <Link
            to="/booking/movies"
            className="text-xs text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
          >
            ← All movies
          </Link>
          <h1 className="text-2xl font-black tracking-wide uppercase mt-1">
            {title || "Showtimes"}
          </h1>
          <p className="text-sm text-(--color-text-muted-dark)">Pick a screening (available first).</p>
        </div>
      </div>

      {avail.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text-muted-dark) mb-2">
            Available
          </h2>
          <ul className="flex flex-col gap-2">
            {avail.map((s) => (
              <ShowtimeRow key={s.showing_id} s={s} />
            ))}
          </ul>
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-(--color-text-muted-dark) mb-2">
            Other / past / full
          </h2>
          <ul className="flex flex-col gap-2">
            {rest.map((s) => (
              <ShowtimeRow key={s.showing_id} s={s} />
            ))}
          </ul>
        </section>
      )}

      {rows.length === 0 && (
        <p className="text-(--color-text-muted-dark) text-center py-12">No showtimes for this movie.</p>
      )}
    </div>
  );
}

function ShowtimeRow({ s }: { s: ShowingRow }) {
  const ok = isShowingBookable(s);
  const head = {
    movie_title: s.movie_title,
    venues_name: s.venues_name,
    showtime_date: s.showtime_date,
    start_time: s.start_time,
  };
  return (
    <li>
      {ok ? (
        <Link
          to={`/booking/showings/${s.showing_id}/seats`}
          state={{ head }}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel) px-4 py-3 hover:border-(--color-input-border-focus) transition-colors"
        >
          <ShowtimeInner s={s} />
        </Link>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--color-border-mid) bg-(--color-surface-overlay) px-4 py-3 opacity-70 cursor-not-allowed">
          <ShowtimeInner s={s} />
        </div>
      )}
    </li>
  );
}

function ShowtimeInner({ s }: { s: ShowingRow }) {
  const time = String(s.start_time).slice(0, 5);
  return (
    <>
      <div>
        <p className="font-bold text-(--color-text-primary-dark)">{s.venues_name}</p>
        <p className="text-sm text-(--color-text-muted-dark)">
          {s.showtime_date} · starts {time}
          {s.language ? ` · ${s.language}` : ""}
        </p>
      </div>
      <div className="text-right text-sm">
        <span className="text-(--color-text-secondary-dark)">
          {s.sold} / {s.capacity} sold
        </span>
        <span className="ml-2 text-(--color-text-muted-dark)">({s.status})</span>
      </div>
    </>
  );
}
