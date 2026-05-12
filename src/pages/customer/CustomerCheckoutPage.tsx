import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { customerApi } from "@/lib/customerApi";

type SeatLine = { seat_id: number; seat_number: string; seat_price: number };

type BookingDetail = {
  booking_id: number;
  status: string;
  payment_proof_url: string | null;
  movie_title: string;
  venues_name: string;
  showtime_date: string;
  start_time: string;
  date: string;
  time: string;
  seats: SeatLine[];
  total: number;
};

function qrImageUrl(payload: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(payload)}`;
}

export default function CustomerCheckoutPage() {
  const { bookingId } = useParams<{ bookingId?: string }>();
  const idParam = bookingId ? Number(bookingId) : NaN;
  const [detail, setDetail] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [completeBusy, setCompleteBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (Number.isInteger(idParam) && idParam > 0) {
        const d = await customerApi.get<BookingDetail>(`/api/customer/bookings/${idParam}`);
        setDetail(d);
      } else {
        const d = await customerApi.get<BookingDetail | null>("/api/customer/bookings/latest");
        setDetail(d);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load booking");
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [idParam]);

  useEffect(() => {
    void load();
  }, [load]);

  const checkout = async () => {
    if (!detail || detail.status !== "Booking") return;
    setCheckoutBusy(true);
    setError(null);
    try {
      const d = await customerApi.post<BookingDetail>(
        `/api/customer/bookings/${detail.booking_id}/checkout`,
        {},
      );
      setDetail(d);
      setShowQr(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setCheckoutBusy(false);
    }
  };

  const complete = async () => {
    if (!detail || detail.status !== "Checkout") return;
    setCompleteBusy(true);
    setError(null);
    try {
      const d = await customerApi.post<BookingDetail>(
        `/api/customer/bookings/${detail.booking_id}/complete`,
        {},
      );
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not complete");
    } finally {
      setCompleteBusy(false);
    }
  };

  if (loading) {
    return <p className="text-(--color-text-muted-dark) text-center py-16">Loading…</p>;
  }

  if (error && !detail) {
    return (
      <div className="text-center py-8">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/booking/movies" className="text-(--color-text-muted-dark) underline">
          Back to movies
        </Link>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-12 border border-(--color-border-dark) rounded-lg">
        <p className="text-(--color-text-muted-dark) mb-4">No booking yet.</p>
        <Link
          to="/booking/movies"
          className="inline-block font-bold py-2 px-4 rounded text-sm uppercase text-white bg-(--color-login-btn-bg)"
        >
          Browse movies
        </Link>
      </div>
    );
  }

  const qrPayload =
    detail.payment_proof_url?.trim() ||
    `booking:${detail.booking_id}:pending`;
  const qrSrc = qrImageUrl(qrPayload);
  const start = String(detail.start_time).slice(0, 5);
  const needsCompleteInModal = showQr && detail.status === "Checkout";

  return (
    <div className="max-w-lg mx-auto flex flex-col gap-6">
      <div>
        <Link
          to="/booking/movies"
          className="text-xs text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
        >
          ← Movies
        </Link>
        <h1 className="text-2xl font-black tracking-wide uppercase mt-1">My booking</h1>
        <p className="text-sm text-(--color-text-muted-dark)">
          Seats stay free until checkout (reserved), then confirmed when you complete the QR step.
        </p>
      </div>

      {error && (
        <div className="text-sm text-red-400 border border-red-900/50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel) p-5 space-y-3 text-sm">
        <Row label="Status" value={detail.status} />
        <Row label="Movie" value={detail.movie_title} />
        <Row label="Venue" value={detail.venues_name} />
        <Row label="Screening" value={`${detail.showtime_date} · ${start}`} />
        <Row label="Booked on" value={`${detail.date} ${String(detail.time).slice(0, 5)}`} />
        <div className="border-t border-(--color-border-mid) pt-3">
          <p className="text-xs uppercase text-(--color-text-muted-dark) mb-1">Seats</p>
          <ul className="space-y-1">
            {detail.seats.map((s) => (
              <li key={s.seat_id} className="flex justify-between">
                <span>{s.seat_number}</span>
                <span className="text-(--color-text-muted-dark)">{s.seat_price}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-(--color-border-mid) pt-3">
          <span>Total</span>
          <span>{detail.total}</span>
        </div>
      </div>

      {detail.status === "Booking" && (
        <button
          type="button"
          disabled={checkoutBusy}
          onClick={() => void checkout()}
          className="w-full font-bold py-3 rounded text-sm tracking-widest uppercase text-white bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:opacity-60"
        >
          {checkoutBusy ? "Processing…" : "Checkout"}
        </button>
      )}

      {detail.status === "Successful" && !showQr && (
        <button
          type="button"
          onClick={() => setShowQr(true)}
          className="w-full font-bold py-2.5 rounded text-sm border border-(--color-border-dark) text-(--color-text-primary-dark) hover:bg-(--color-surface-panel-mid)"
        >
          Show ticket QR
        </button>
      )}

      {showQr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-(--color-surface-panel) rounded-lg border border-(--color-border-dark) p-6 max-w-sm w-full text-center">
            <p className="text-sm font-bold uppercase tracking-wide mb-2">
              {detail.status === "Checkout" ? "Hold QR" : "Ticket"}
            </p>
            {detail.status === "Checkout" && (
              <p className="text-xs text-(--color-text-muted-dark) mb-3">
                Seats are reserved. Tap <strong className="text-(--color-text-primary-dark)">Complete</strong>{" "}
                to confirm and activate your ticket.
              </p>
            )}
            {detail.status === "Successful" && (
              <p className="text-xs text-(--color-text-muted-dark) mb-3">Payment complete — show this at the door.</p>
            )}
            <img src={qrSrc} alt="Ticket QR" className="mx-auto rounded border border-(--color-border-mid)" />
            <p className="text-xs text-(--color-text-muted-dark) mt-3 break-all">{qrPayload}</p>
            {needsCompleteInModal ? (
              <button
                type="button"
                className="mt-5 w-full font-bold py-2.5 rounded text-sm uppercase text-white bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:opacity-60"
                disabled={completeBusy}
                onClick={() => void complete()}
              >
                {completeBusy ? "Working…" : "Complete"}
              </button>
            ) : (
              <button
                type="button"
                className="mt-5 w-full font-bold py-2 rounded text-sm uppercase border border-(--color-border-dark) text-(--color-text-primary-dark) hover:bg-(--color-surface-panel-mid)"
                onClick={() => setShowQr(false)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <Link
        to="/booking/movies"
        className="text-center text-sm text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
      >
        Book another movie
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-(--color-text-muted-dark)">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
