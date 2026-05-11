import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  useBookingStore,
  type Booking,
  type BookingFilters,
} from "../store/useBookingStore";

const ITEMS_PER_PAGE = 11;

type BookingStatus = Booking["status"];

const STATUS_STYLES: Record<BookingStatus, string> = {
  Successful: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  Booking: "bg-amber-400/15 text-amber-700 dark:text-amber-400",
  Checkout: "bg-blue-400/15 text-blue-700 dark:text-blue-400",
  Cancel: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const DOT_STYLES: Record<BookingStatus, string> = {
  Successful: "bg-emerald-500",
  Booking: "bg-amber-500",
  Checkout: "bg-blue-500",
  Cancel: "bg-red-500",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status] ?? ""}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status] ?? ""}`}
      />
      {status}
    </span>
  );
}

function PaymentProofBtn({ url }: { url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1.5 rounded border border-(--color-input-border) bg-(--color-border-dark)/40 px-2 py-1 text-[11px] text-(--color-text-secondary-dark) transition-colors hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark)"
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="13" height="16" rx="1" />
        <line x1="6" y1="7" x2="14" y2="7" />
        <line x1="6" y1="10" x2="14" y2="10" />
        <polyline points="9,13 11,15 14,12" />
      </svg>
      View
    </a>
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
    "flex h-8 w-8 items-center justify-center rounded border text-sm font-bold transition-colors border-(--color-page-active-border) bg-(--color-page-active-bg) text-(--color-page-active-text) hover:bg-(--color-page-active-bg)";

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
            width="13"
            height="13"
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
            width="13"
            height="13"
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

export default function BookingPage() {
  const { bookings, loading, error, fetchBookings, cancelBooking } =
    useBookingStore();

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<Set<BookingStatus>>(
    () => new Set(),
  );
  const [page, setPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters: BookingFilters = {
        search: search || undefined,
        status:
          selectedStatuses.size > 0
            ? Array.from(selectedStatuses).join(",")
            : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };
      void fetchBookings(filters);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, selectedStatuses, dateFrom, dateTo]);

  const handleCancel = (id: number) => {
    if (!window.confirm("Cancel this booking? This cannot be undone.")) return;
    void cancelBooking(id);
  };

  const totalPages = Math.max(1, Math.ceil(bookings.length / ITEMS_PER_PAGE));
  const paginated = bookings.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const toggleStatus = (s: BookingStatus) => {
    setSelectedStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setPage(1);
  };
  const handleClearDateRange = () => {
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const control =
    "rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";
  const tdClass =
    "px-4 py-3 text-sm border-b border-(--color-border-dark)/60 align-middle";
  const rowClass =
    "transition-colors hover:bg-(--color-surface-panel-mid)/40 last:border-b-0";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-(--color-surface-panel) p-5">
      {/* Error banner */}
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Toolbar row 1 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5">
          <svg
            className="shrink-0 text-(--color-input-placeholder)"
            width="13"
            height="13"
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
            className="w-44 border-none bg-transparent text-sm text-(--color-input-text) outline-none placeholder:text-(--color-input-placeholder)"
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
            Booking Status
          </span>
          <div className="flex gap-1">
            {(["Successful", "Booking", "Checkout", "Cancel"] as const).map(
              (s) => {
                const active = selectedStatuses.has(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleStatus(s)}
                    aria-pressed={active}
                    className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-(--color-pill-active-bg) text-(--color-pill-active-text)"
                        : "bg-(--color-pill-idle-bg) text-(--color-pill-idle-text) hover:bg-(--color-pill-idle-bg-hover)"
                    }`}
                  >
                    {s.toLowerCase()}
                  </button>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Toolbar row 2 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
            Date Range
          </span>
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className={control}
            aria-label="From date"
          />
          <span className="text-sm text-(--color-text-secondary-dark)">to</span>
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className={control}
            aria-label="To date"
          />
          <button
            type="button"
            onClick={handleClearDateRange}
            disabled={!dateFrom && !dateTo}
            className="rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-xs font-medium text-(--color-text-secondary-dark) transition-colors hover:border-(--color-input-border-focus) hover:text-(--color-text-primary-dark) disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-(--color-input-border) disabled:hover:text-(--color-text-secondary-dark)"
          >
            Clear
          </button>
        </div>

        <div className="flex-1" />
      </div>

      {/* Table */}
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-(--color-border-dark)">
        <table className="w-full border-collapse">
          <thead>
            <tr className="sticky top-0 z-10 bg-(--color-surface-panel-mid)">
              {[
                "Booking ID",
                "Customer Name",
                "Movie Title",
                "Showtime",
                "Seats",
                "Total Amount",
                "Payment Proof",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap border border-(--color-border-dark) px-4 py-3 text-center text-sm font-semibold text-(--color-text-primary-dark)"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                  <tr key={i} className={rowClass}>
                    {Array.from({ length: 9 }).map((__, j) => (
                      <td key={j} className={tdClass}>
                        <div className="h-4 rounded animate-pulse bg-(--color-border-dark)" />
                      </td>
                    ))}
                  </tr>
                ))
              : paginated.map((b) => {
                  const showtime = `${b.showtime_date} ${b.start_time.slice(0, 5)}`;
                  const canCancel =
                    b.status === "Booking" || b.status === "Checkout";
                  return (
                    <tr key={b.booking_id} className={rowClass}>
                      <td className={tdClass}>
                        <span className="font-mono text-xs text-(--color-text-secondary-dark)">
                          {b.booking_id}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="font-medium text-(--color-text-primary-dark)">
                          {b.display_name || b.customer}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="block truncate text-(--color-text-secondary-dark)">
                          {b.movie}
                        </span>
                      </td>
                      <td className={tdClass}>
                        <span className="whitespace-nowrap text-xs text-(--color-text-secondary-dark)">
                          {showtime}
                        </span>
                      </td>
                      <td
                        className={`${tdClass} text-center text-(--color-text-secondary-dark)`}
                      >
                        {b.seats}
                      </td>
                      <td className={`${tdClass} text-right`}>
                        <span className="font-medium tabular-nums text-(--color-text-primary-dark)">
                          ${b.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {b.payment_proof_url ? (
                          <PaymentProofBtn url={b.payment_proof_url} />
                        ) : (
                          <span className="text-(--color-text-muted-dark)">
                            —
                          </span>
                        )}
                      </td>
                      <td className={tdClass}>
                        <StatusBadge status={b.status} />
                      </td>
                      <td className={`${tdClass} text-center`}>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => handleCancel(b.booking_id)}
                            className="rounded border border-red-500/40 px-2 py-1 text-[11px] font-medium text-red-400 transition-colors hover:bg-red-500/10"
                          >
                            Cancel
                          </button>
                        ) : (
                          <span className="text-(--color-text-muted-dark)">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}

            {!loading && paginated.length === 0 && (
              <tr>
                <td
                  className="px-4 py-12 text-center text-sm text-(--color-text-disabled-dark)"
                  colSpan={9}
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
