import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api } from "../lib/api";

const FILTERS = ["This Week", "This Month", "This Year"] as const;
type FilterKey = (typeof FILTERS)[number];

const PERIOD_MAP: Record<FilterKey, string> = {
  "This Week":  "weekly",
  "This Month": "monthly",
  "This Year":  "yearly",
};

const REPORT_TYPES = [
  "Sales, Inventory",
  "Occupancy",
  "Top Movies",
  "Revenue by Venue",
];

const FILTER_BY = ["Movie", "Venue", "Date Range"];

interface ReportStats {
  sales: number;
  topMovie: string;
  occupancy: number;
}

interface DailyRevenue {
  day: string;
  revenueK: number;
}

interface MonthlyRevenue {
  month: string;
  revenueK: number;
}

type BreakdownGroupBy = "date" | "movie" | "venue";
type BreakdownMetric = "sales" | "occupancy";

interface SalesBreakdownRow {
  label: string;
  bookings: number;
  seatsSold: number;
  revenue: number;
}

interface OccupancyBreakdownRow {
  label: string;
  totalSeats: number;
  soldSeats: number;
  occupancyRate: number;
}

type PreviewColumn = { key: string; label: string };
type PreviewRow = Record<string, string | number>;

function escapeCsv(value: string | number): string {
  const text = String(value ?? "");
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", {
    month: "short",
  });
}

const tooltipContentStyle = {
  backgroundColor: "var(--color-surface-card)",
  border: "1px solid var(--color-surface-card-border)",
  borderRadius: "6px",
  fontSize: "12px",
} as const;

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-(--color-chart-area-fill) ${className}`}
    />
  );
}

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("This Year");
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [filterBy, setFilterBy] = useState("Date Range");

  const [stats, setStats] = useState<ReportStats | null>(null);
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-fetch charts when period filter changes
  useEffect(() => {
    setLoadingCharts(true);
    setError(null);
    const period = PERIOD_MAP[activeFilter];
    Promise.all([
      api.get<DailyRevenue[]>(`/api/reports/revenue/daily?period=${period}`),
      api.get<MonthlyRevenue[]>("/api/reports/revenue/monthly"),
    ])
      .then(([daily, monthly]) => {
        setDailyRevenue(daily);
        setMonthlyRevenue(monthly);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load charts");
      })
      .finally(() => setLoadingCharts(false));
  }, [activeFilter]);

  // Re-fetch stats when period filter changes
  useEffect(() => {
    setLoadingStats(true);
    setError(null);
    api
      .get<ReportStats>(`/api/reports/stats?period=${PERIOD_MAP[activeFilter]}`)
      .then((data) => setStats(data))
      .catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Failed to load report stats",
        );
      })
      .finally(() => setLoadingStats(false));
  }, [activeFilter]);

  const dailyData = dailyRevenue.map((r) => ({
    day: formatDay(r.day),
    fullDate: r.day,
    revenueK: Number(r.revenueK),
  }));

  const monthlyData = monthlyRevenue.map((r) => ({
    month: formatMonth(r.month),
    revenueK: Number(r.revenueK),
  }));

  const selectedGroupBy: BreakdownGroupBy =
    filterBy === "Movie" ? "movie" : filterBy === "Venue" ? "venue" : "date";

  const effectiveGroupBy: BreakdownGroupBy =
    reportType === "Top Movies"
      ? "movie"
      : reportType === "Revenue by Venue"
        ? "venue"
        : selectedGroupBy;
  const isFilterByLocked =
    reportType === "Top Movies" || reportType === "Revenue by Venue";

  const metric: BreakdownMetric = reportType === "Occupancy" ? "occupancy" : "sales";

  const previewColumns: PreviewColumn[] =
    metric === "occupancy"
      ? [
          {
            key: "label",
            label:
              effectiveGroupBy === "date"
                ? "Date"
                : effectiveGroupBy === "movie"
                  ? "Movie"
                  : "Venue",
          },
          { key: "soldSeats", label: "Sold Seats" },
          { key: "totalSeats", label: "Total Seats" },
          { key: "occupancyRate", label: "Occupancy %" },
        ]
      : [
          {
            key: "label",
            label:
              effectiveGroupBy === "date"
                ? "Date"
                : effectiveGroupBy === "movie"
                  ? "Movie"
                  : "Venue",
          },
          { key: "bookings", label: "Bookings" },
          { key: "seatsSold", label: "Seats Sold" },
          { key: "revenue", label: "Revenue ($)" },
        ];

  const hasExportData =
    stats != null ||
    dailyRevenue.length > 0 ||
    monthlyRevenue.length > 0 ||
    previewRows.length > 0;

  useEffect(() => {
    setLoadingPreview(true);
    setError(null);
    const period = PERIOD_MAP[activeFilter];
    api
      .get<Array<SalesBreakdownRow | OccupancyBreakdownRow>>(
        `/api/reports/breakdown?period=${period}&groupBy=${effectiveGroupBy}&metric=${metric}`,
      )
      .then((rows) => {
        if (metric === "occupancy") {
          setPreviewRows(
            (rows as OccupancyBreakdownRow[]).map((row) => ({
              label: row.label,
              soldSeats: Number(row.soldSeats ?? 0),
              totalSeats: Number(row.totalSeats ?? 0),
              occupancyRate: Number(row.occupancyRate ?? 0),
            })),
          );
          return;
        }
        setPreviewRows(
          (rows as SalesBreakdownRow[]).map((row) => ({
            label: row.label,
            bookings: Number(row.bookings ?? 0),
            seatsSold: Number(row.seatsSold ?? 0),
            revenue: Number(row.revenue ?? 0),
          })),
        );
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load preview report");
        setPreviewRows([]);
      })
      .finally(() => setLoadingPreview(false));
  }, [activeFilter, effectiveGroupBy, metric]);

  function handleGenerateReport() {
    if (!hasExportData) {
      setError("No data available to export yet. Please wait for report data to load.");
      return;
    }

    setExporting(true);
    try {
      const now = new Date();
      const stamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");

      const rows: Array<Array<string | number>> = [];
      rows.push(["Cinema Report Export"]);
      rows.push(["Generated At", now.toLocaleString("en-US")]);
      rows.push(["Period", activeFilter]);
      rows.push(["Report Type", reportType]);
      rows.push(["Filter By", filterBy || "All"]);
      rows.push([]);

      rows.push(["Summary"]);
      rows.push(["Metric", "Value"]);
      rows.push(["Total Sales", stats ? stats.sales.toFixed(2) : "N/A"]);
      rows.push(["Top Movie by Revenue", stats?.topMovie ?? "N/A"]);
      rows.push(["Average Occupancy (%)", stats != null ? stats.occupancy : "N/A"]);
      rows.push([]);

      rows.push(["Daily Revenue"]);
      rows.push(["Date", "Revenue"]);
      dailyRevenue.forEach((row) => {
        rows.push([row.day, Number(row.revenueK).toFixed(2)]);
      });
      rows.push([]);

      rows.push(["Monthly Revenue"]);
      rows.push(["Month", "Revenue"]);
      monthlyRevenue.forEach((row) => {
        rows.push([row.month, Number(row.revenueK).toFixed(2)]);
      });
      rows.push([]);

      rows.push(["Preview Data"]);
      rows.push(previewColumns.map((column) => column.label));
      previewRows.forEach((row) => {
        rows.push(previewColumns.map((column) => row[column.key] ?? ""));
      });

      const csv = toCsv(rows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cinema-report-${PERIOD_MAP[activeFilter]}-${stamp}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-y-auto min-w-0 p-5 gap-5 bg-(--color-surface-light)">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Time filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-(--color-text-secondary-light)">
          Filter :
        </span>
        <div className="flex gap-0 rounded overflow-hidden border border-(--color-filter-pill-border)">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium border-r border-(--color-filter-pill-border) last:border-r-0 transition-colors whitespace-nowrap ${
                activeFilter === f
                  ? "bg-(--color-filter-pill-active-bg) text-(--color-filter-pill-active-text) font-semibold"
                  : "bg-(--color-filter-pill-idle-bg) text-(--color-filter-pill-idle-text) hover:bg-(--color-filter-pill-idle-bg-hover)"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {loadingStats
          ? Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)"
              >
                <SkeletonBlock className="mb-2 h-3 w-28" />
                <SkeletonBlock className="h-9 w-24" />
              </div>
            ))
          : [
              {
                label: "Total Sales",
                value: stats
                  ? `$${stats.sales.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : "—",
              },
              {
                label: "Top Movie by Revenue",
                value: stats?.topMovie ?? "—",
              },
              {
                label: "Average Occupancy",
                value: stats != null ? `${stats.occupancy}%` : "—",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)"
              >
                <p className="text-sm mb-1 text-(--color-text-muted-light)">
                  {card.label}
                </p>
                <p className="text-3xl font-bold leading-tight text-(--color-text-primary-light)">
                  {card.value}
                </p>
              </div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Daily Revenue Line chart */}
        <div className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)">
          <p className="text-sm font-bold mb-3 text-(--color-text-primary-light)">
            Daily Revenue Trend
          </p>
          {loadingCharts ? (
            <SkeletonBlock className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                >
                  <CartesianGrid
                    stroke="var(--color-chart-grid)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-chart-axis)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-chart-axis)" }}
                    width={52}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullDate
                        ? new Date(`${payload[0].payload.fullDate}T00:00:00`).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })
                        : ""
                    }
                    formatter={(value) => [
                      `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      "Revenue",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenueK"
                    stroke="var(--color-chart-line)"
                    strokeWidth={2}
                    fill="var(--color-chart-area-fill)"
                    fillOpacity={0.6}
                    dot={false}
                    activeDot={{ r: 4, fill: "var(--color-chart-line)" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Monthly Revenue Bar chart */}
        <div className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)">
          <p className="text-sm font-bold mb-3 text-(--color-text-primary-light)">
            Monthly Revenue (rolling year)
          </p>
          {loadingCharts ? (
            <SkeletonBlock className="h-[200px] w-full" />
          ) : (
            <div className="h-[200px] w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                  barCategoryGap="18%"
                >
                  <CartesianGrid
                    stroke="var(--color-chart-grid)"
                    strokeDasharray="4 4"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-chart-axis)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
                    tickLine={false}
                    axisLine={{ stroke: "var(--color-chart-axis)" }}
                    width={52}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`
                    }
                  />
                  <Tooltip
                    contentStyle={tooltipContentStyle}
                    formatter={(value) => [
                      `$${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
                      "Revenue",
                    ]}
                  />
                  <Bar
                    dataKey="revenueK"
                    fill="var(--color-chart-bar-fill)"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-lg px-5 py-5 border bg-(--color-surface-card) border-(--color-surface-card-border)">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-bold text-(--color-text-primary-light)">
            Report Preview
          </p>
          <p className="text-xs text-(--color-text-muted-light)">
            Grouped by {effectiveGroupBy} • {metric === "occupancy" ? "Occupancy" : "Sales"}
          </p>
        </div>
        {loadingPreview ? (
          <SkeletonBlock className="h-[140px] w-full" />
        ) : previewRows.length === 0 ? (
          <div className="rounded border border-(--color-border-light) px-3 py-8 text-center text-sm text-(--color-text-muted-light)">
            No preview data for the selected report options.
          </div>
        ) : (
          <div className="overflow-x-auto rounded border border-(--color-border-light)">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-(--color-chart-area-fill)">
                  {previewColumns.map((column) => (
                    <th
                      key={column.key}
                      className="border border-(--color-surface-card-border) px-3 py-2 text-left text-xs font-semibold text-(--color-text-secondary-light)"
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, index) => (
                  <tr
                    key={`${row.label}-${index}`}
                    className={index % 2 === 0 ? "bg-(--color-surface-light)" : "bg-(--color-surface-card)"}
                  >
                    {previewColumns.map((column) => {
                      const value = row[column.key];
                      const formatted =
                        typeof value === "number"
                          ? column.key === "revenue"
                            ? value.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            : column.key === "occupancyRate"
                              ? value.toLocaleString("en-US", {
                                  minimumFractionDigits: 1,
                                  maximumFractionDigits: 1,
                                })
                              : value.toLocaleString("en-US")
                          : String(value ?? "—");
                      return (
                        <td
                          key={column.key}
                          className="border border-(--color-border-light) px-3 py-2.5 text-sm text-(--color-text-primary-light)"
                        >
                          {formatted}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report generator */}
      <div className="rounded-lg px-5 py-5 border bg-(--color-surface-card) border-(--color-surface-card-border)">
        <p className="text-sm font-bold mb-4 text-(--color-text-primary-light)">
          Generate Report
        </p>
        <div className="flex items-end gap-4 flex-wrap">
          {/* Report Type */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-40">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Report Type
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full appearance-none rounded px-3 py-2 text-sm outline-none pr-8 bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-secondary-light)"
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-text-muted-light)"
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

          {/* Filter By */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-40">
            <label className="text-sm font-semibold text-(--color-text-secondary-light)">
              Filter By
            </label>
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                disabled={isFilterByLocked}
                className="w-full appearance-none rounded px-3 py-2 text-sm outline-none pr-8 bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-muted-light) disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {FILTER_BY.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-(--color-text-muted-light)"
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
            <p className="text-xs text-(--color-text-muted-light)">
              {isFilterByLocked
                ? reportType === "Top Movies"
                  ? "Locked by report type: grouped by movie."
                  : "Locked by report type: grouped by venue."
                : "Controls how preview rows are grouped."}
            </p>
          </div>

          {/* Generate button */}
          <button
            type="button"
            onClick={handleGenerateReport}
            disabled={exporting || loadingStats || loadingCharts || loadingPreview}
            title={exporting ? "Generating report..." : "Download CSV report"}
            className="px-5 py-2 text-sm font-semibold rounded whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            {exporting ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
