const FILTERS = [
  "This Hour",
  "This Day",
  "This Week",
  "This Month",
  "Last Month",
  "This Year",
];

/** Summary tiles — roughly aligned with mock chart scale (daily revenue in low tens of K). */
const STATS = {
  "This Hour": {
    sales: "$3.8 K",
    topMovie: "Dune: Part Three",
    occupancy: "6.2%",
  },
  "This Day": {
    sales: "$47.2 K",
    topMovie: "The Wild Robot",
    occupancy: "41.5%",
  },
  "This Week": {
    sales: "$312 K",
    topMovie: "Avatar: Fire and Ash",
    occupancy: "58.3%",
  },
  "This Month": {
    sales: "$1.28 M",
    topMovie: "Thunderbolts",
    occupancy: "72.1%",
  },
  "Last Month": {
    sales: "$1.19 M",
    topMovie: "Mickey 17",
    occupancy: "69.4%",
  },
  "This Year": {
    sales: "$14.2 M",
    topMovie: "Avatar: Fire and Ash",
    occupancy: "64.8%",
  },
};

/**
 * Last 7 days — daily gross (thousands USD). Shape mirrors a typical cinema week:
 * quiet Mon–Wed, picks up Thu, peaks Fri–Sun.
 */
const REVENUE_LINE = [
  { day: "Mon", revenueK: 28.4 },
  { day: "Tue", revenueK: 31.6 },
  { day: "Wed", revenueK: 34.2 },
  { day: "Thu", revenueK: 46.8 },
  { day: "Fri", revenueK: 72.5 },
  { day: "Sat", revenueK: 91.2 },
  { day: "Sun", revenueK: 84.7 },
] as const;

/**
 * Rolling 12 months — net ticket revenue (thousands USD). Holiday / summer bumps.
 */
const MONTHLY_REVENUE_K = [
  { month: "Jan", revenueK: 118 },
  { month: "Feb", revenueK: 132 },
  { month: "Mar", revenueK: 145 },
  { month: "Apr", revenueK: 156 },
  { month: "May", revenueK: 178 },
  { month: "Jun", revenueK: 224 },
  { month: "Jul", revenueK: 268 },
  { month: "Aug", revenueK: 241 },
  { month: "Sep", revenueK: 162 },
  { month: "Oct", revenueK: 188 },
  { month: "Nov", revenueK: 205 },
  { month: "Dec", revenueK: 298 },
] as const;

const REPORT_TYPES = ["Sales, Inventory", "Revenue", "Occupancy", "Bookings"];
const FILTER_BY = ["All Movies", "By Movie", "By Screen", "By Date"];

export {
  FILTERS,
  STATS,
  REVENUE_LINE,
  MONTHLY_REVENUE_K,
  REPORT_TYPES,
  FILTER_BY,
};
