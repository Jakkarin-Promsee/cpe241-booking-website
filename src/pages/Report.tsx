import { useState } from "react";
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
import {
  FILTERS,
  STATS,
  REVENUE_LINE,
  MONTHLY_REVENUE_K,
  REPORT_TYPES,
  FILTER_BY,
} from "../store/tempReportdata";

function formatK(value: number | undefined) {
  if (value == null || Number.isNaN(value)) return "—";
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: value % 1 ? 1 : 0,
    maximumFractionDigits: 1,
  })}k`;
}

const tooltipContentStyle = {
  backgroundColor: "var(--color-surface-card)",
  border: "1px solid var(--color-surface-card-border)",
  borderRadius: "6px",
  fontSize: "12px",
} as const;

function RevenueTrendChart() {
  return (
    <div className="h-[200px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={[...REVENUE_LINE]}
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
            domain={[0, 100]}
            width={40}
            tickFormatter={(v) => `${v}k`}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(day) => String(day)}
            formatter={(value) => [
              formatK(typeof value === "number" ? value : Number(value)),
              "Gross",
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
  );
}

function RevenueBarChart() {
  return (
    <div className="h-[200px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[...MONTHLY_REVENUE_K]}
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
            domain={[0, 320]}
            width={44}
            tickFormatter={(v) => `${v}k`}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            formatter={(value) => [
              formatK(typeof value === "number" ? value : Number(value)),
              "Gross",
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
  );
}

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] =
    useState<keyof typeof STATS>("This Year");
  const [reportType, setReportType] = useState("Sales, Inventory");
  const [filterBy, setFilterBy] = useState("");

  const stats = STATS[activeFilter];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto min-w-0 p-5 gap-5 bg-(--color-surface-light)">
      {/* Time filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-(--color-text-secondary-light)">
          Filter :
        </span>
        <div className="flex gap-0 rounded overflow-hidden border border-(--color-filter-pill-border)">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f as keyof typeof STATS)}
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
        {[
          { label: "Total Sales", value: stats.sales },
          { label: "Top Movie by Revenue", value: stats.topMovie },
          { label: "Average Occupancy", value: stats.occupancy },
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
        {/* Line chart */}
        <div className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)">
          <p className="text-sm font-bold mb-3 text-(--color-text-primary-light)">
            Daily Revenue Trend
          </p>
          <RevenueTrendChart />
        </div>

        {/* Bar chart */}
        <div className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)">
          <p className="text-sm font-bold mb-3 text-(--color-text-primary-light)">
            Monthly Revenue (rolling year)
          </p>
          <RevenueBarChart />
        </div>
      </div>

      {/* Report generator */}
      <div className="rounded-lg px-5 py-5 border bg-(--color-surface-card) border-(--color-surface-card-border)">
        <p className="text-sm font-bold mb-4 text-(--color-text-primary-light)">
          Upcoming Showtimes
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
                className="w-full appearance-none rounded px-3 py-2 text-sm outline-none pr-8 bg-(--color-surface-card) border border-(--color-border-light) focus:border-(--color-login-input-border-focus) text-(--color-text-muted-light)"
              >
                <option value="">Filter By</option>
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
          </div>

          {/* Generate button */}
          <button
            onClick={() => console.log("Generate:", reportType, filterBy)}
            className="px-5 py-2 text-sm font-semibold rounded transition-colors whitespace-nowrap bg-(--color-btn-secondary-bg) hover:bg-(--color-btn-secondary-bg-hover) text-(--color-btn-secondary-text)"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
