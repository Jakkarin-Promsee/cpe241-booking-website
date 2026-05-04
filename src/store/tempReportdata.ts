const FILTERS = [
  "This Hour",
  "This Day",
  "This Week",
  "This Month",
  "Last Month",
  "This Year",
];

const STATS = {
  "This Hour": { sales: "$0.12 K", topMovie: "Avengers", occupancy: "0.01%" },
  "This Day": { sales: "$4.50 K", topMovie: "Titanic", occupancy: "12.5%" },
  "This Week": { sales: "$31.2 K", topMovie: "Avatar 2", occupancy: "34.2%" },
  "This Month": { sales: "$210 K", topMovie: "Hoppers", occupancy: "61.3%" },
  "Last Month": { sales: "$198 K", topMovie: "Doraemon", occupancy: "58.7%" },
  "This Year": { sales: "$7.67 B", topMovie: "Hoppers", occupancy: "0.01%" },
};

const REVENUE_LINE = [
  { x: 0, y: 55 },
  { x: 12, y: 70 },
  { x: 22, y: 50 },
  { x: 33, y: 65 },
  { x: 44, y: 45 },
  { x: 55, y: 60 },
  { x: 66, y: 52 },
  { x: 77, y: 35 },
  { x: 88, y: 20 },
  { x: 100, y: 5 },
];

const BAR_DATA = [38, 28, 42, 32, 55, 35, 48, 38, 60, 45, 65, 72];

const REPORT_TYPES = ["Sales, Inventory", "Revenue", "Occupancy", "Bookings"];
const FILTER_BY = ["All Movies", "By Movie", "By Screen", "By Date"];

export { FILTERS, STATS, REVENUE_LINE, BAR_DATA, REPORT_TYPES, FILTER_BY };
