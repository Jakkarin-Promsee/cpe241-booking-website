import { useState } from "react";
import { BOOKINGS } from "../store/tempBookingData";

const ITEMS_PER_PAGE = 6;

const STATUS_STYLES = {
  Confirmed: "bg-green-200 text-green-800",
  Cancelled: "bg-red-200 text-red-800",
  Pending: "bg-yellow-200 text-yellow-800",
};

const BOOKING_STATUS_ACTIVE = "bg-neutral-500 text-white";
const BOOKING_STATUS_INACTIVE =
  "bg-neutral-700 text-neutral-300 hover:bg-neutral-600";

function PaymentProofIcon() {
  return (
    <div className="flex flex-col items-center gap-0.5 cursor-pointer group">
      <div className="w-8 h-9 border border-neutral-400 rounded-sm bg-neutral-700 group-hover:bg-neutral-600 transition flex items-center justify-center relative overflow-hidden">
        {/* Receipt lines */}
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none">
          <rect
            x="1"
            y="1"
            width="18"
            height="22"
            rx="1"
            stroke="#aaa"
            strokeWidth="1.2"
            fill="#555"
          />
          <line x1="4" y1="6" x2="16" y2="6" stroke="#aaa" strokeWidth="1" />
          <line x1="4" y1="9" x2="16" y2="9" stroke="#aaa" strokeWidth="1" />
          <line x1="4" y1="12" x2="12" y2="12" stroke="#aaa" strokeWidth="1" />
          <polyline
            points="10,16 13,19 18,13"
            stroke="#6ee7b7"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="text-[9px] text-neutral-400 group-hover:text-neutral-300">
        view
      </span>
    </div>
  );
}

function Pagination({ current, total, onChange }) {
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
          onClick={btn.action}
          disabled={btn.disabled}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          onClick={() => onChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors
            ${p === current ? "bg-neutral-200 text-neutral-900 border-neutral-200" : "border-neutral-500 text-neutral-300 hover:bg-neutral-600"}`}
        >
          {p}
        </button>
      ))}

      {total > 3 && <span className="text-neutral-400 px-1">...</span>}

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
          onClick={btn.action}
          disabled={btn.disabled}
          className="w-8 h-8 flex items-center justify-center rounded border border-neutral-500 text-neutral-300 hover:bg-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };
  const handleBooking = (s) => {
    setBookingStatus(s);
    setPage(1);
  };
  const handleShow = (e) => {
    setShowStatus(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-neutral-800 p-5 gap-4">
      {/* Toolbar row 1 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5">
          <svg
            width="13"
            height="13"
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
            className="bg-transparent border-none outline-none text-sm text-neutral-200 placeholder-neutral-400 w-44"
          />
        </div>

        <div className="flex-1" />

        {/* Booking status pills */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-300 whitespace-nowrap">
            Booking Status
          </span>
          <div className="flex gap-1">
            {["Confirmed", "Pending", "Cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => handleBooking(bookingStatus === s ? "All" : s)}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors
                  ${bookingStatus === s ? BOOKING_STATUS_ACTIVE : BOOKING_STATUS_INACTIVE}`}
              >
                {s.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toolbar row 2 */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Date range */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-300 whitespace-nowrap">
            Date Range
          </span>
          <input
            type="date"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5 text-sm text-neutral-200 outline-none focus:border-neutral-400 transition"
          />
        </div>

        <div className="flex-1" />

        {/* Show status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-neutral-300 whitespace-nowrap">
            Show Status
          </span>
          <div className="relative">
            <select
              value={showStatus}
              onChange={handleShow}
              className="appearance-none bg-neutral-700 border border-neutral-500 rounded px-3 py-1.5 pr-8 text-sm text-neutral-200 outline-none cursor-pointer focus:border-neutral-400"
            >
              <option>All</option>
              <option>Confirmed</option>
              <option>Pending</option>
              <option>Cancelled</option>
            </select>
            <svg
              className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400"
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
      <div className="flex-1 overflow-auto rounded-lg border border-neutral-600">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-700 sticky top-0 z-10">
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
                  className="px-4 py-3 text-center text-sm font-semibold text-neutral-200 border border-neutral-600 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.map((b) => (
              <tr
                key={b.id}
                className="border-b border-neutral-700 hover:bg-neutral-700/30 transition-colors"
              >
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-200 text-center">
                  {b.id}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-200 font-medium text-center">
                  {b.customer}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300 text-center">
                  {b.movie}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300 text-center whitespace-nowrap">
                  {b.showtime}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300 text-center">
                  {b.seats}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-sm text-neutral-300 text-center">
                  ${b.amount.toFixed(2)}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-center">
                  {b.hasProof ? (
                    <div className="flex justify-center">
                      <PaymentProofIcon />
                    </div>
                  ) : null}
                </td>
                <td className="px-4 py-3 border border-neutral-700 text-center">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-neutral-500 text-sm"
                >
                  No bookings found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}
