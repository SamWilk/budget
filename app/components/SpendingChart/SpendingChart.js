import styles from "./SpendingChart.module.css";

const COLORS = [
  "#6366f1",
  "#38bdf8",
  "#2dd4bf",
  "#a78bfa",
  "#7dd3fc",
  "#5eead4",
  "#818cf8",
  "#67e8f9",
];

function getSlices(data) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);
  if (total === 0) return [];

  let cumulative = 0;
  return data.map((d, i) => {
    const pct = d.amount / total;
    const startAngle = cumulative * 2 * Math.PI;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI;
    return {
      ...d,
      pct,
      startAngle,
      endAngle,
      color: COLORS[i % COLORS.length],
    };
  });
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = {
    x: cx + r * Math.sin(startAngle),
    y: cy - r * Math.cos(startAngle),
  };
  const end = {
    x: cx + r * Math.sin(endAngle),
    y: cy - r * Math.cos(endAngle),
  };
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

export default function SpendingChart({ transactions }) {
  const expensesByCategory = {};
  for (const t of transactions) {
    if (t.amount >= 0) continue;
    const cat = t.category || "Unknown";
    expensesByCategory[cat] =
      (expensesByCategory[cat] || 0) + Math.abs(t.amount);
  }

  const data = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const slices = getSlices(data);
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  if (data.length === 0) {
    return (
      <section className={styles.container}>
        <h2 className={styles.title}>Spending Breakdown</h2>
        <p className={styles.empty}>No expenses to show yet.</p>
      </section>
    );
  }

  return (
    <section className={styles.container}>
      <h2 className={styles.title}>Spending Breakdown</h2>
      <div className={styles.content}>
        <svg
          className={styles.chart}
          viewBox="0 0 200 200"
          role="img"
          aria-label="Spending pie chart"
        >
          {slices.length === 1 ? (
            <circle cx="100" cy="100" r="90" fill={slices[0].color} />
          ) : (
            slices.map((s, i) => (
              <path
                key={i}
                d={describeArc(100, 100, 90, s.startAngle, s.endAngle)}
                fill={s.color}
              />
            ))
          )}
          <circle cx="100" cy="100" r="52" fill="var(--surface)" />
          <text
            x="100"
            y="96"
            textAnchor="middle"
            fill="var(--text)"
            fontSize="16"
            fontWeight="700"
          >
            $
            {total.toLocaleString("en-US", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </text>
          <text
            x="100"
            y="114"
            textAnchor="middle"
            fill="var(--text-secondary)"
            fontSize="11"
          >
            total spent
          </text>
        </svg>
        <ul className={styles.legend}>
          {slices.map((s, i) => (
            <li key={i} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: s.color }} />
              <span className={styles.legendLabel}>{s.category}</span>
              <span className={styles.legendValue}>
                $
                {s.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className={styles.legendPct}>
                {(s.pct * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
