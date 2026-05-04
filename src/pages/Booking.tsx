import { useState, type ChangeEvent } from "react";
import { BOOKINGS } from "../store/tempBookingData";

const ITEMS_PER_PAGE = 6;

/** Tailwind + CSS variables from `index.css` (:root) — edit palette there only */
const STATUS_BADGE_CLASS = {
  Confirmed:
    "bg-(--color-status-confirmed-bg) text-(--color-status-confirmed-text)",
  Cancelled:
    "bg-(--color-status-cancelled-bg) text-(--color-status-cancelled-text)",
  Pending: "bg-(--color-status-pending-bg) text-(--color-status-pending-text)",
} as const;

type BookingStatusKey = keyof typeof STATUS_BADGE_CLASS;

function PaymentProofIcon() {
  return (
    <div className="group flex flex-col items-center gap-0.5 cursor-pointer">
      <div className="flex h-9 w-8 items-center justify-center overflow-hidden rounded-sm border border-(--color-input-border) bg-(--color-pill-idle-bg) transition-colors hover:bg-(--color-pill-idle-bg-hover)">
        <svg
          width="20"
          height="24"
          viewBox="0 0 20 24"
          fill="none"
          className="[&_rect]:stroke-(--color-text-muted-dark) [&_rect]:fill-(--color-border-dark) [&_line]:stroke-(--color-text-muted-dark) [&_polyline]:stroke-(--color-payment-proof-check)"
        >
          <rect x="1" y="1" width="18" height="22" rx="1" strokeWidth="1.2" />
          <line x1="4" y1="6" x2="16" y2="6" strokeWidth="1" />
          <line x1="4" y1="9" x2="16" y2="9" strokeWidth="1" />
          <line x1="4" y1="12" x2="12" y2="12" strokeWidth="1" />
          <polyline
            points="10,16 13,19 18,13"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
      <span className="text-[9px] leading-none text-(--color-text-muted-dark) transition-colors group-hover:text-(--color-text-secondary-dark)">
        view
      </span>
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
  /* Idle vs active use separate class strings so `text-*` utilities never conflict in the cascade */
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
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [bookingStatus, setBookingStatus] = useState("All");
  const [showStatus, setShowStatus] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = BOOKINGS.filter((b) => {
    const q = search.toLowerCase();
    const matchSearch =
      String(b.id).includes(q) ||
      b.customer.toLowerCase().includes(q) ||
      b.movie.toLowerCase().includes(q);
    const matchBooking = bookingStatus === "All" || b.status === bookingStatus;
    const matchShow = showStatus === "All" || b.status === showStatus;
    return matchSearch && matchBooking && matchShow;
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
  const handleBooking = (s: BookingStatusKey | "All") => {
    setBookingStatus(s);
    setPage(1);
  };
  const handleShow = (e: ChangeEvent<HTMLSelectElement>) => {
    setShowStatus(e.target.value);
    setPage(1);
  };

  const control =
    "rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";
  const tdBase =
    "border border-(--color-border-mid) px-4 py-3 text-center text-sm";
  const rowHover =
    "transition-colors hover:bg-[color-mix(in_srgb,var(--color-surface-panel-mid)_30%,transparent)]";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden bg-(--color-surface-panel) p-5">
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
            {["Confirmed", "Pending", "Cancelled"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  handleBooking(
                    bookingStatus === s ? "All" : (s as BookingStatusKey),
                  )
                }
                className={`rounded px-3 py-1 text-xs font-semibold transition-colors ${
                  bookingStatus === s
                    ? "bg-(--color-pill-active-bg) text-(--color-pill-active-text)"
                    : "bg-(--color-pill-idle-bg) text-(--color-pill-idle-text) hover:bg-(--color-pill-idle-bg-hover)"
                }`}
              >
                {s.toLowerCase()}
              </button>
            ))}
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
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className={control}
          />
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
            Show Status
          </span>
          <div className="relative">
            <select
              value={showStatus}
              onChange={handleShow}
              className={`${control} cursor-pointer appearance-none pr-8`}
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <svg
              className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-(--color-text-muted-dark)"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
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
            {paginated.map((b) => (
              <tr key={b.id} className={rowHover}>
                <td className={`${tdBase} text-(--color-text-primary-dark)`}>
                  {b.id}
                </td>
                <td
                  className={`${tdBase} font-medium text-(--color-text-primary-dark)`}
                >
                  {b.customer}
                </td>
                <td className={`${tdBase} text-(--color-text-secondary-dark)`}>
                  {b.movie}
                </td>
                <td
                  className={`${tdBase} whitespace-nowrap text-(--color-text-secondary-dark)`}
                >
                  {b.showtime}
                </td>
                <td className={`${tdBase} text-(--color-text-secondary-dark)`}>
                  {b.seats}
                </td>
                <td className={`${tdBase} text-(--color-text-secondary-dark)`}>
                  ${b.amount.toFixed(2)}
                </td>
                <td className={tdBase}>
                  {b.hasProof ? (
                    <div className="flex justify-center">
                      <PaymentProofIcon />
                    </div>
                  ) : null}
                </td>
                <td className={tdBase}>
                  <span
                    className={`rounded px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASS[b.status as BookingStatusKey]}`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  className="px-4 py-12 text-center text-sm text-(--color-text-disabled-dark)"
                  colSpan={8}
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
