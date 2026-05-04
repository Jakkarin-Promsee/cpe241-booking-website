import { useState, type ChangeEvent } from "react";
import { BOOKINGS } from "../store/tempBookingData";

const ITEMS_PER_PAGE = 6;

type BookingStatus = "Confirmed" | "Pending" | "Cancelled";

// ─── Stat Cards ───────────────────────────────────────────────────────────────

function StatCards() {
  const total = BOOKINGS.length;
  const confirmed = BOOKINGS.filter((b) => b.status === "Confirmed").length;
  const pending = BOOKINGS.filter((b) => b.status === "Pending").length;
  const revenue = BOOKINGS.filter((b) => b.status === "Confirmed").reduce(
    (sum, b) => sum + b.amount,
    0,
  );

  const stats = [
    { label: "Total Bookings", value: total },
    { label: "Confirmed", value: confirmed },
    { label: "Pending", value: pending },
    { label: "Revenue", value: `$${revenue.toFixed(2)}` },
  ];

  return (
    <div className="grid grid-cols-4 gap-2.5 mb-3.5">
      {stats.map((s) => (
        <div
          key={s.label}
          className="rounded-lg bg-(--color-surface-panel-mid) px-3.5 py-2.5"
        >
          <div className="text-[11px] uppercase tracking-widest text-(--color-text-muted-dark) mb-1">
            {s.label}
          </div>
          <div className="text-xl font-medium text-(--color-text-primary-dark)">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<BookingStatus, string> = {
  Confirmed: "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  Pending: "bg-amber-400/15 text-amber-700 dark:text-amber-400",
  Cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const DOT_STYLES: Record<BookingStatus, string> = {
  Confirmed: "bg-emerald-500",
  Pending: "bg-amber-500",
  Cancelled: "bg-red-500",
};

function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[status]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${DOT_STYLES[status]}`} />
      {status}
    </span>
  );
}

// ─── Status Pill Toggle ───────────────────────────────────────────────────────

const PILL_ACTIVE: Record<BookingStatus, string> = {
  Confirmed:
    "bg-emerald-500/12 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  Pending:
    "bg-amber-400/15 text-amber-700 dark:text-amber-400 border-amber-400/30",
  Cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/25",
};

function StatusPills({
  active,
  onToggle,
}: {
  active: BookingStatus | "All";
  onToggle: (s: BookingStatus) => void;
}) {
  const statuses: BookingStatus[] = ["Confirmed", "Pending", "Cancelled"];
  return (
    <div className="flex gap-1">
      {statuses.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onToggle(s)}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            active === s
              ? PILL_ACTIVE[s]
              : "border-(--color-input-border) bg-(--color-input-bg) text-(--color-text-secondary-dark) hover:bg-(--color-border-dark)"
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  );
}

// ─── Payment Proof Button ─────────────────────────────────────────────────────

function PaymentProofBtn() {
  return (
    <button
      type="button"
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
    </button>
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
  const nav =
    "flex h-[30px] w-[30px] items-center justify-center rounded border border-(--color-page-btn-border) bg-(--color-input-bg) text-(--color-page-btn-text) transition-colors hover:bg-(--color-page-btn-bg-hover) disabled:cursor-not-allowed disabled:opacity-30";
  const idle =
    "flex h-[30px] w-[30px] items-center justify-center rounded border border-(--color-page-btn-border) bg-(--color-input-bg) text-sm text-(--color-page-btn-text) transition-colors hover:bg-(--color-page-btn-bg-hover)";
  const act =
    "flex h-[30px] w-[30px] items-center justify-center rounded border border-(--color-page-active-border) bg-(--color-page-active-bg) text-sm font-semibold text-(--color-page-active-text)";

  return (
    <div className="flex items-center justify-center gap-1 py-4">
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
          onClick={() => onChange(p)}
          className={p === current ? act : idle}
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

export default function BookingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BookingStatus | "All">(
    "All",
  );
  const [sortBy, setSortBy] = useState("");
  const [page, setPage] = useState(1);

  const handleToggleStatus = (s: BookingStatus) => {
    setStatusFilter((prev) => (prev === s ? "All" : s));
    setPage(1);
  };

  const filtered = (() => {
    const q = search.toLowerCase();
    let data = BOOKINGS.filter((b) => {
      const matchSearch =
        String(b.id).toLowerCase().includes(q) ||
        b.customer.toLowerCase().includes(q) ||
        b.movie.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortBy === "amount-desc")
      data = [...data].sort((a, b) => b.amount - a.amount);
    else if (sortBy === "amount-asc")
      data = [...data].sort((a, b) => a.amount - b.amount);
    else if (sortBy === "customer")
      data = [...data].sort((a, b) => a.customer.localeCompare(b.customer));

    return data;
  })();

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const control =
    "rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-1.5 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";

  const thClass =
    "px-4 py-2.5 text-left text-[11px] font-medium uppercase tracking-widest text-(--color-text-muted-dark) border-b border-(--color-border-dark) whitespace-nowrap";

  const tdClass =
    "px-4 py-3 text-sm border-b border-(--color-border-dark)/60 align-middle";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden bg-(--color-surface-panel) p-5">
      {/* ── Stat Cards ── */}
      <StatCards />

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
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
            placeholder="Search ID, customer, movie…"
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-44 border-none bg-transparent text-sm text-(--color-input-text) outline-none placeholder:text-(--color-input-placeholder)"
          />
        </div>

        {/* Status pills */}
        <StatusPills active={statusFilter} onToggle={handleToggleStatus} />

        <div className="flex-1" />

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-sm text-(--color-text-secondary-dark)">
            Sort by
          </span>
          <select
            value={sortBy}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className={`cursor-pointer ${control}`}
          >
            <option value="">Booking ID</option>
            <option value="amount-desc">Amount ↓</option>
            <option value="amount-asc">Amount ↑</option>
            <option value="customer">Customer A–Z</option>
          </select>
        </div>
      </div>

      {/* ── Row count ── */}
      <div className="text-[11px] uppercase tracking-widest text-(--color-text-muted-dark)">
        {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* ── Table ── */}
      <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-(--color-border-dark)">
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            <col style={{ width: "80px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "160px" }} />
            <col style={{ width: "140px" }} />
            <col style={{ width: "60px" }} />
            <col style={{ width: "100px" }} />
            <col style={{ width: "80px" }} />
            <col style={{ width: "110px" }} />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-(--color-surface-panel-mid)">
            <tr>
              <th className={thClass}>ID</th>
              <th className={thClass}>Customer</th>
              <th className={thClass}>Movie</th>
              <th className={thClass}>Showtime</th>
              <th className={`${thClass} text-center`}>Seats</th>
              <th className={`${thClass} text-right`}>Amount</th>
              <th className={`${thClass} text-center`}>Proof</th>
              <th className={thClass}>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-sm text-(--color-text-muted-dark)"
                >
                  No bookings found.
                </td>
              </tr>
            ) : (
              paginated.map((b) => (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-(--color-surface-panel-mid)/40 last:border-b-0"
                >
                  <td className={tdClass}>
                    <span className="font-mono text-xs text-(--color-text-secondary-dark)">
                      {b.id}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="font-medium text-(--color-text-primary-dark)">
                      {b.customer}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-(--color-text-secondary-dark) truncate block">
                      {b.movie}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <span className="whitespace-nowrap text-xs text-(--color-text-secondary-dark)">
                      {b.showtime}
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
                    {b.hasProof ? (
                      <PaymentProofBtn />
                    ) : (
                      <span className="text-(--color-text-muted-dark)">—</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    <StatusBadge status={b.status as BookingStatus} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
