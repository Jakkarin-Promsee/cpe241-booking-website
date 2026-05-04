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
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + cH}
        stroke="#bbb"
        strokeWidth="1"
      />
      <line
        x1={pad.l}
        y1={pad.t + cH}
        x2={pad.l + cW}
        y2={pad.t + cH}
        stroke="#bbb"
        strokeWidth="1"
      />
      {/* Area fill */}
      <path d={areaPath} fill="#e0e0e0" opacity="0.6" />
      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="#555"
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
          stroke="#ddd"
          strokeWidth="1"
        />
      ))}
      {/* Axes */}
      <line
        x1={pad.l}
        y1={pad.t}
        x2={pad.l}
        y2={pad.t + cH}
        stroke="#bbb"
        strokeWidth="1"
      />
      <line
        x1={pad.l}
        y1={pad.t + cH}
        x2={pad.l + cW}
        y2={pad.t + cH}
        stroke="#bbb"
        strokeWidth="1"
      />
      {/* Bars */}
      {BAR_DATA.map((val, i) => {
        const barH = (val / 100) * cH;
        const x = pad.l + i * gap + (gap - barW) / 2;
        const y = pad.t + cH - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} fill="#bbb" rx="2" />
            <rect x={x} y={y} width={barW} height={4} fill="#888" rx="1" />
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
    <div className="flex-1 flex flex-col overflow-y-auto min-w-0 bg-neutral-100 p-5 gap-5">
      {/* Time filter pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-neutral-700">Filter :</span>
        <div className="flex gap-0 border border-neutral-300 rounded overflow-hidden">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium border-r border-neutral-300 last:border-r-0 transition-colors whitespace-nowrap
                ${
                  activeFilter === f
                    ? "bg-neutral-300 text-neutral-900 font-semibold"
                    : "bg-white text-neutral-600 hover:bg-neutral-100"
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
            className="bg-white border border-neutral-300 rounded-lg px-5 py-4"
          >
            <p className="text-sm text-neutral-500 mb-1">{card.label}</p>
            <p className="text-3xl font-bold text-neutral-900 leading-tight">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Line chart */}
        <div className="bg-white border border-neutral-300 rounded-lg px-5 py-4">
          <p className="text-sm font-bold text-neutral-800 mb-3">
            Daily Revenue Trend
          </p>
          <LineChart />
        </div>

        {/* Bar chart */}
        <div className="bg-white border border-neutral-300 rounded-lg px-5 py-4">
          <p className="text-sm font-bold text-neutral-800 mb-3">
            Daily Revenue Trend
          </p>
          <BarChart />
        </div>
      </div>

      {/* Report generator */}
      <div className="bg-white border border-neutral-300 rounded-lg px-5 py-5">
        <p className="text-sm font-bold text-neutral-800 mb-4">
          Upcoming Showtimes
        </p>
        <div className="flex items-end gap-4 flex-wrap">
          {/* Report Type */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-40">
            <label className="text-sm font-semibold text-neutral-700">
              Report Type
            </label>
            <div className="relative">
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-700 outline-none focus:border-neutral-600 bg-white pr-8"
              >
                {REPORT_TYPES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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
            <label className="text-sm font-semibold text-neutral-700">
              Filter By
            </label>
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="w-full appearance-none border border-neutral-400 rounded px-3 py-2 text-sm text-neutral-400 outline-none focus:border-neutral-600 bg-white pr-8"
              >
                <option value="">Filter By</option>
                {FILTER_BY.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <svg
                className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500"
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
            className="px-5 py-2 bg-neutral-400 hover:bg-neutral-500 text-white text-sm font-semibold rounded transition-colors whitespace-nowrap"
          >
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
}
