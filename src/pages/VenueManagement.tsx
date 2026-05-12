import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useVenueStore, type Venue } from "../store/useVenueStore";
import { groupSeatsByRow } from "../lib/seatRowGrouping";

function VenueForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  initial?: { name: string; address: string };
  onSubmit: (data: { name: string; address: string }) => void;
  onCancel?: () => void;
  submitLabel: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [address, setAddress] = useState(initial?.address ?? "");

  const canSave = name.trim().length > 0 && address.trim().length > 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSubmit({ name: name.trim(), address: address.trim() });
    if (!initial) {
      setName("");
      setAddress("");
    }
  };

  const inputClass =
    "w-full rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus)";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={inputClass}
        placeholder="Venue name"
      />
      <input
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className={inputClass}
        placeholder="Venue address"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!canSave}
          className="rounded bg-(--color-btn-primary-bg) px-3 py-1.5 text-sm font-semibold text-(--color-btn-primary-text) transition-colors hover:bg-(--color-btn-primary-bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-(--color-input-border) px-3 py-1.5 text-sm text-(--color-text-secondary-dark) hover:bg-(--color-pill-idle-bg-hover)"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default function VenueManagementPage() {
  const {
    venues,
    seats,
    selectedVenueId,
    loading,
    error,
    fetchVenues,
    createVenue,
    updateVenue,
    deleteVenue,
    selectVenue,
    fetchVenueSeats,
    assignSeatNumbers,
    removeSeat,
  } = useVenueStore();

  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [seatInput, setSeatInput] = useState("");

  const sortedSeatRows = useMemo(() => groupSeatsByRow(seats), [seats]);

  useEffect(() => {
    void fetchVenues();
  }, []);

  useEffect(() => {
    if (!selectedVenueId) return;
    void fetchVenueSeats(selectedVenueId);
  }, [selectedVenueId]);

  const selectedVenue = useMemo(
    () => venues.find((v) => v.venues_id === selectedVenueId) ?? null,
    [venues, selectedVenueId],
  );

  const handleAddVenue = (data: { name: string; address: string }) => {
    void createVenue(data).then(() => fetchVenues());
  };

  const handleUpdateVenue = (data: { name: string; address: string }) => {
    if (!editingVenue) return;
    void updateVenue(editingVenue.venues_id, data).then(() => {
      setEditingVenue(null);
      void fetchVenues();
    });
  };

  const handleDeleteVenue = (venue: Venue) => {
    if (!window.confirm(`Delete "${venue.venues_name}"?`)) return;
    void deleteVenue(venue.venues_id).then(() => fetchVenues());
  };

  const handleAddSeats = () => {
    if (!selectedVenueId) return;
    const seatNumbers = [...new Set(
      seatInput
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean)
    )];
    if (seatNumbers.length === 0) return;
    void assignSeatNumbers(selectedVenueId, seatNumbers).then(() => {
      setSeatInput("");
    });
  };

  const handleRemoveSeat = (seatId: number) => {
    if (!selectedVenueId) return;
    if (!window.confirm("Remove this seat from venue?")) return;
    void removeSeat(selectedVenueId, seatId);
  };

  const cardClass = "rounded-lg border border-(--color-border-dark) bg-(--color-surface-panel-mid)";

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-(--color-surface-panel) p-5">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className={`${cardClass} p-4`}>
          <h3 className="mb-3 text-sm font-semibold text-(--color-text-primary-dark)">
            Venue Management
          </h3>

          <div className="mb-4">
            {editingVenue ? (
              <VenueForm
                key={`edit-${editingVenue.venues_id}`}
                initial={{
                  name: editingVenue.venues_name,
                  address: editingVenue.venues_address,
                }}
                submitLabel="Save Venue"
                onSubmit={handleUpdateVenue}
                onCancel={() => setEditingVenue(null)}
              />
            ) : (
              <VenueForm
                key="new"
                submitLabel="Add Venue"
                onSubmit={handleAddVenue}
              />
            )}
          </div>

          <div className="overflow-hidden rounded border border-(--color-border-dark)">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--color-surface-overlay)">
                  {["Name", "Address", "Seats", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="border border-(--color-border-dark) px-3 py-2 text-left text-xs font-semibold text-(--color-text-primary-dark)"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {venues.map((venue) => {
                  const active = selectedVenueId === venue.venues_id;
                  return (
                    <tr
                      key={venue.venues_id}
                      className={`cursor-pointer ${active ? "bg-(--color-pill-active-bg)/35" : "hover:bg-(--color-table-row-hover)"}`}
                      onClick={() => selectVenue(venue.venues_id)}
                    >
                      <td className="border border-(--color-border-mid) px-3 py-2 text-sm text-(--color-text-primary-dark)">
                        {venue.venues_name}
                      </td>
                      <td className="border border-(--color-border-mid) px-3 py-2 text-sm text-(--color-text-secondary-dark)">
                        {venue.venues_address}
                      </td>
                      <td className="border border-(--color-border-mid) px-3 py-2 text-sm text-(--color-text-secondary-dark)">
                        {active ? seats.length : venue.seat_count}
                      </td>
                      <td className="border border-(--color-border-mid) px-3 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingVenue(venue);
                            }}
                            className="rounded border border-(--color-input-border) px-2 py-1 text-xs text-(--color-text-secondary-dark) hover:bg-(--color-pill-idle-bg-hover)"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteVenue(venue);
                            }}
                            className="rounded border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {venues.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-3 py-8 text-center text-sm text-(--color-text-disabled-dark)"
                    >
                      No venues yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={`${cardClass} p-4`}>
          <h3 className="mb-1 text-sm font-semibold text-(--color-text-primary-dark)">
            Venue Seats
          </h3>
          <p className="mb-3 text-xs text-(--color-text-secondary-dark)">
            {selectedVenue
              ? `Manage seats for ${selectedVenue.venues_name}`
              : "Select a venue to manage seats"}
          </p>

          <div className="mb-3 flex gap-2">
            <input
              value={seatInput}
              onChange={(e) => setSeatInput(e.target.value)}
              disabled={!selectedVenueId}
              placeholder="A1, A2, B1"
              className="w-full rounded border border-(--color-input-border) bg-(--color-input-bg) px-3 py-2 text-sm text-(--color-input-text) outline-none transition focus:border-(--color-input-border-focus) disabled:opacity-50"
            />
            <button
              type="button"
              onClick={handleAddSeats}
              disabled={!selectedVenueId}
              className="whitespace-nowrap rounded bg-(--color-btn-primary-bg) px-3 py-2 text-sm font-semibold text-(--color-btn-primary-text) transition-colors hover:bg-(--color-btn-primary-bg-hover) disabled:cursor-not-allowed disabled:opacity-50"
            >
              Add Seats
            </button>
          </div>

          <div className="rounded border border-(--color-border-dark) p-3">
            {loading ? (
              <div className="text-sm text-(--color-text-secondary-dark)">Loading seats...</div>
            ) : seats.length === 0 ? (
              <div className="text-sm text-(--color-text-disabled-dark)">No seats assigned.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {sortedSeatRows.map((row) => (
                  <div key={row.row} className="rounded border border-(--color-border-mid) p-2">
                    <div className="mb-2 text-[11px] font-semibold text-(--color-text-secondary-dark)">
                      Row {row.row}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {row.seats.map((seat) => (
                        <div
                          key={seat.seat_id}
                          className="inline-flex items-center gap-2 rounded-full border border-(--color-input-border) bg-(--color-surface-overlay) px-3 py-1 text-xs"
                        >
                          <span className="font-semibold text-(--color-text-primary-dark)">
                            {seat.seat_number}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSeat(seat.seat_id)}
                            className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] text-red-500 hover:bg-red-500/20"
                          >
                            remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

