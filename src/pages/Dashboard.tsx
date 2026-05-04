import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  STATUS_CARDS,
  TREND_DATA,
  SHOWTIMES,
} from "../store/tempDashboardData";

function StatusCards() {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-(--color-text-primary-light)">
        Status Cards
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-4 py-3"
          >
            <p className="mb-1.5 text-xs text-(--color-text-muted-light)">
              {card.label}
            </p>
            <p className="text-2xl leading-tight font-bold text-(--color-text-primary-light)">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart() {
  return (
    <div className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-(--color-text-primary-light)">
        Weekly Booking Trend
      </p>
      <div className="h-[200px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={TREND_DATA}
            margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          >
            <CartesianGrid
              stroke="var(--color-chart-grid)"
              strokeDasharray="4 4"
              vertical={false}
            />
            <XAxis
              dataKey="x"
              tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-chart-axis)" }}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
              tickLine={false}
              axisLine={{ stroke: "var(--color-chart-axis)" }}
              domain={[0, 100]}
              width={36}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-surface-card)",
                border: "1px solid var(--color-surface-card-border)",
                borderRadius: "6px",
                fontSize: "12px",
              }}
              labelFormatter={(day) => String(day)}
              formatter={(value) => [
                value != null ? String(value) : "",
                "Volume (index)",
              ]}
            />
            <Area
              type="monotone"
              dataKey="y"
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
    </div>
  );
}

function ShowtimesTable() {
  return (
    <div className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-(--color-text-primary-light)">
        Upcoming Showtimes
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-(--color-chart-area-fill)">
              {["Movie", "Screen", "Time", "Seats Sold"].map((h) => (
                <th
                  key={h}
                  className="border border-(--color-surface-card-border) px-3 py-2 text-left text-xs font-semibold text-(--color-text-secondary-light)"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHOWTIMES.map((row, i) => {
              const pct = Math.min(
                100,
                Math.round((row.sold / row.capacity) * 100),
              );
              return (
                <tr
                  key={`${row.movie}-${row.time}-${row.screen}`}
                  className={
                    i % 2 === 0
                      ? "bg-(--color-surface-light)"
                      : "bg-(--color-surface-card)"
                  }
                >
                  <td className="border border-(--color-border-light) px-3 py-2.5 text-sm font-medium text-(--color-text-primary-light)">
                    {row.movie}
                  </td>
                  <td className="border border-(--color-border-light) px-3 py-2.5 text-sm text-(--color-text-secondary-light)">
                    {row.screen}
                  </td>
                  <td className="border border-(--color-border-light) px-3 py-2.5 font-mono text-sm text-(--color-text-secondary-light) tabular-nums">
                    {row.time}
                  </td>
                  <td className="border border-(--color-border-light) px-3 py-2.5">
                    <div className="flex min-w-[140px] flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
                      <span className="shrink-0 font-mono text-sm tabular-nums text-(--color-text-primary-light)">
                        {row.sold} / {row.capacity}
                        <span className="ml-1.5 text-xs font-normal text-(--color-text-muted-light)">
                          ({pct}%)
                        </span>
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-(--color-chart-area-fill)">
                        <div
                          className="h-full rounded-full bg-(--color-chart-bar-fill)"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto">
      <StatusCards />
      <TrendChart />
      <ShowtimesTable />
    </div>
  );
}
