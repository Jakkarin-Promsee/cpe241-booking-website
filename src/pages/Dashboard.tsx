import {
  STATUS_CARDS,
  TREND_DATA,
  SHOWTIMES,
} from "../store/tempDashboardData";

function StatusCards() {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-neutral-800">Status Cards</p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_CARDS.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-neutral-300 bg-white px-4 py-3"
          >
            <p className="mb-1.5 text-xs text-neutral-500">{card.label}</p>
            <p className="text-2xl leading-tight font-bold text-neutral-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrendChart() {
  const W = 560,
    H = 150;
  const pad = { t: 12, r: 16, b: 12, l: 16 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;

  const pts = TREND_DATA.map((d) => [
    pad.l + (d.x / 100) * cW,
    pad.t + ((100 - d.y) / 100) * cH,
  ]);

  const linePath = pts
    .map(
      (p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`,
    )
    .join(" ");

  return (
    <div className="rounded-md border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-neutral-800">
        Weekly Booking Trend
      </p>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={pad.l}
            x2={pad.l + cW}
            y1={pad.t + f * cH}
            y2={pad.t + f * cH}
            stroke="#ececec"
            strokeWidth="1"
          />
        ))}
        <line
          x1={pad.l}
          y1={pad.t}
          x2={pad.l}
          y2={pad.t + cH}
          stroke="#ccc"
          strokeWidth="1"
        />
        <line
          x1={pad.l}
          y1={pad.t + cH}
          x2={pad.l + cW}
          y2={pad.t + cH}
          stroke="#ccc"
          strokeWidth="1"
        />
        <path
          d={linePath}
          fill="none"
          stroke="#333"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function ShowtimesTable() {
  return (
    <div className="rounded-md border border-neutral-300 bg-white px-5 py-4">
      <p className="mb-3 text-sm font-semibold text-neutral-800">
        Upcoming Showtimes
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-neutral-200">
              {["Movie", "Screen", "Time", "Seats Sold"].map((h) => (
                <th
                  key={h}
                  className="border border-neutral-300 px-3 py-2 text-left text-xs font-semibold text-neutral-600"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHOWTIMES.map((row, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-neutral-50" : "bg-white"}
              >
                {[row.movie, row.screen, row.time, row.seats].map((_, j) => (
                  <td key={j} className="border border-neutral-200 px-3 py-2.5">
                    <div
                      className="h-3 rounded bg-neutral-300"
                      style={{
                        width: j === 3 ? 40 : j === 2 ? 70 : j === 1 ? 60 : 100,
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <>
      <StatusCards />
      <TrendChart />
      <ShowtimesTable />
    </>
  );
}
