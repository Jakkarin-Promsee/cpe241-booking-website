const STATUS_CARDS = [
  { label: "Total movies", value: "67 Active" },
  { label: "Screens Online", value: "6/7" },
  { label: "Bookings today", value: "420" },
  { label: "Today's Revenue", value: "$456,000" },
];

/** Mock last 7 days: `y` is normalized booking volume (0–100) for the chart Y-axis. */
const TREND_DATA = [
  { x: "Mon", y: 22 },
  { x: "Tue", y: 31 },
  { x: "Wed", y: 38 },
  { x: "Thu", y: 46 },
  { x: "Fri", y: 78 },
  { x: "Sat", y: 96 },
  { x: "Sun", y: 58 },
] as const;

/** Upcoming showtimes (mock): `sold` / `capacity` per screen. */
const SHOWTIMES = [
  {
    movie: "The Wild Robot",
    screen: "Screen 2",
    time: "12:15 PM",
    sold: 128,
    capacity: 160,
  },
  {
    movie: "Dune: Part Two",
    screen: "Screen 1 · IMAX",
    time: "1:00 PM",
    sold: 198,
    capacity: 200,
  },
  {
    movie: "Oppenheimer (70mm)",
    screen: "Screen 4",
    time: "2:30 PM",
    sold: 96,
    capacity: 120,
  },
  {
    movie: "Wicked",
    screen: "Screen 3",
    time: "3:45 PM",
    sold: 142,
    capacity: 180,
  },
  {
    movie: "Gladiator II",
    screen: "Screen 5",
    time: "5:10 PM",
    sold: 74,
    capacity: 140,
  },
  {
    movie: "Moana 2",
    screen: "Screen 6",
    time: "6:00 PM",
    sold: 155,
    capacity: 160,
  },
  {
    movie: "Nosferatu",
    screen: "Screen 7",
    time: "8:20 PM",
    sold: 52,
    capacity: 90,
  },
  {
    movie: "Dune: Part Two",
    screen: "Screen 1 · IMAX",
    time: "9:30 PM",
    sold: 176,
    capacity: 200,
  },
];

export { STATUS_CARDS, TREND_DATA, SHOWTIMES };
