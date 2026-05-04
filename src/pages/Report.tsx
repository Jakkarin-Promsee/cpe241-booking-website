import { useState } from "react";
import {
  FILTERS,
  STATS,
  REVENUE_LINE,
  BAR_DATA,
  REPORT_TYPES,
  FILTER_BY,
} from "../store/tempReportdata";

function LineChart() {
  const W = 300,
    H = 160;
  const pad = { t: 12, r: 12, b: 20, l: 20 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const pts = REVENUE_LINE.map((d) => [
    pad.l + (d.x / 100) * cW,
    pad.t + (d.y / 100) * cH,
  ]);

  const linePath = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`,
    )
    .join(" ");
  const areaPath =
    linePath +
    ` L${pts[pts.length - 1][0]},${pad.t + cH} L${pts[0][0]},${pad.t + cH} Z`;

  const gridStroke = "var(--color-chart-grid)";
  const axisStroke = "var(--color-chart-axis)";
  const areaFill = "var(--color-chart-area-fill)";
  const lineStroke = "var(--color-chart-line)";

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad.l}
          x2={pad.l + cW}
          y1={pad.t + f * cH}
          y2={pad.t + f * cH}
          stroke={gridStroke}
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + cH}
        stroke={axisStroke}
        strokeWidth="1"
      />
      <line
        x1={pad.l}
        y1={pad.t + cH}
        x2={pad.l + cW}
        y2={pad.t + cH}
        stroke={axisStroke}
        strokeWidth="1"
      />
      {/* Area fill */}
      <path d={areaPath} fill={areaFill} opacity="0.6" />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke={lineStroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BarChart() {
  const W = 300,
    H = 160;
  const pad = { t: 12, r: 12, b: 20, l: 20 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const barW = (cW / BAR_DATA.length) * 0.55;
  const gap = cW / BAR_DATA.length;

  const gridStroke = "var(--color-chart-grid)";
  const axisStroke = "var(--color-chart-axis)";
  const barFill = "var(--color-chart-bar-fill)";
  const barTopFill = "var(--color-chart-bar-top)";

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((f) => (
        <line
          key={f}
          x1={pad.l}
          x2={pad.l + cW}
          y1={pad.t + f * cH}
          y2={pad.t + f * cH}
          stroke={gridStroke}
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + cH}
        stroke={axisStroke}
        strokeWidth="1"
      />
      <line
        x1={pad.l}
        y1={pad.t + cH}
        x2={pad.l + cW}
        y2={pad.t + cH}
        stroke={axisStroke}
        strokeWidth="1"
      />
      {/* Bars */}
      {BAR_DATA.map((val, i) => {
        const barH = (val / 100) * cH;
        const x = pad.l + i * gap + (gap - barW) / 2;
        const y = pad.t + cH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill={barFill} rx="2" />
            <rect x={x} y={y} width={barW} height={4} fill={barTopFill} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

export default function ReportsPage() {
  const [activeFilter, setActiveFilter] = useState("This Year");
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
          <LineChart />
        </div>

        {/* Bar chart */}
        <div className="rounded-lg px-5 py-4 border bg-(--color-surface-card) border-(--color-surface-card-border)">
          <p className="text-sm font-bold mb-3 text-(--color-text-primary-light)">
            Daily Revenue Trend
          </p>
          <BarChart />
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
