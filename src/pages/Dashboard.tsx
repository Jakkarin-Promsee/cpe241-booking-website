import { useEffect } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardStore } from "../store/useDashboardStore";

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-(--color-chart-area-fill) ${className}`}
    />
  );
}

function StatusCards() {
  const { stats, loading } = useDashboardStore();

  const cards = stats
    ? [
        { label: "Active Movies", value: String(stats.activeMovies) },
        { label: "Screens Online", value: String(stats.onlineScreens) },
        { label: "Today's Bookings", value: String(stats.todayBookings) },
        {
          label: "Today's Revenue",
          value: `฿${stats.todayRevenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
        },
      ]
    : [];

  return (
    <div>
      <p className="mb-3 text-sm font-bold text-(--color-text-primary-light)">
        Status Cards
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-4 py-3"
              >
                <SkeletonBlock className="mb-2 h-3 w-24" />
                <SkeletonBlock className="h-7 w-16" />
              </div>
            ))
          : cards.map((card) => (
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
  const { trend, loading } = useDashboardStore();

  return (
    <div className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-(--color-text-primary-light)">
        Weekly Booking Trend
      </p>
      {loading ? (
        <SkeletonBlock className="h-[200px] w-full" />
      ) : (
        <div className="h-[200px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
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
                tickFormatter={(day: string) =>
                  new Date(day + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" })
                }
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-text-muted-light)" }}
                tickLine={false}
                axisLine={{ stroke: "var(--color-chart-axis)" }}
                allowDecimals={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface-card)",
                  border: "1px solid var(--color-surface-card-border)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
                labelFormatter={(day: string) =>
                  new Date(day + "T00:00:00").toLocaleDateString("en-US", {
                    weekday: "long", month: "short", day: "numeric",
                  })
                }
                formatter={(value) => [
                  value != null ? String(value) : "",
                  "Bookings",
                ]}
              />
              <Area
                type="monotone"
                dataKey="count"
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
  );
}

function ShowtimesTable() {
  const { upcoming, loading } = useDashboardStore();

  return (
    <div className="rounded-md border border-(--color-surface-card-border) bg-(--color-surface-card) px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-(--color-text-primary-light)">
        Upcoming Showtimes
      </p>
      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
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
              {upcoming.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-sm text-(--color-text-muted-light)"
                  >
                    No upcoming showtimes today.
                  </td>
                </tr>
              ) : (
                upcoming.map((row, i) => {
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
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { fetchAll, error } = useDashboardStore();

  useEffect(() => {
    void fetchAll();
  }, []);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-5 overflow-y-auto">
      {error && (
        <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {error}
        </div>
      )}
      <StatusCards />
      <TrendChart />
      <ShowtimesTable />
    </div>
  );
}
