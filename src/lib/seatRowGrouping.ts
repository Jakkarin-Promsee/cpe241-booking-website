/** Shared seat layout: group by leading letter row (same as VenueManagement + SeatPricingModal). */

export function rowKeyFromSeatNumber(seatNumber: string): string {
  const match = seatNumber.match(/^[A-Za-z]+/);
  return (match?.[0] ?? "#").toUpperCase();
}

export function compareSeatNumbers(a: string, b: string): number {
  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function groupSeatsByRow<T extends { seat_number: string }>(
  seats: T[],
): { row: string; seats: T[] }[] {
  const grouped = new Map<string, T[]>();
  for (const seat of seats) {
    const key = rowKeyFromSeatNumber(seat.seat_number);
    const existing = grouped.get(key) ?? [];
    existing.push(seat);
    grouped.set(key, existing);
  }
  return Array.from(grouped.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([row, rowSeats]) => ({
      row,
      seats: [...rowSeats].sort((x, y) =>
        compareSeatNumbers(x.seat_number, y.seat_number),
      ),
    }));
}
