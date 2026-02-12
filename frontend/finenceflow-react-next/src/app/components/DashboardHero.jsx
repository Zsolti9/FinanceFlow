"use client";

import styles from "./dashboardHero.module.css";

export default function DashboardHero({
  remainingFt = 0,                 // ✅ EZ JÖN A HOME-BÓL
  budgetFt = 0,
  categoryStats = [],              // [{ name, pct, emoji }]
  recent = [],                     // [{ title, amount }]
  seriesValues = [],               // number[]
  trendText = "",
}) {
  const rem = Number(remainingFt || 0);
  const sign = rem >= 0 ? "+" : "-";
  const abs = Math.abs(rem);

  const centerText = `${categoryStats?.[0]?.pct ?? 0}%`;

  return (
    <div className={styles.Wrapper}>
      <div className={styles.Grid}>
        {/* BAL FELSŐ: Havi keretből maradt */}
        <div className={`${styles.Panel} ${styles.LeftTop}`}>
          <div className={styles.Header}>
            <div className={styles.Title}>Havi egyenleg</div>
            <span className={styles.LiveDot} />
          </div>

          <div
            className={styles.BalanceValue}
            style={{ color: rem >= 0 ? "#4ade80" : "#ff6b6b" }}
          >
            {sign}
            {abs.toLocaleString("hu-HU")} Ft
          </div>

          <div className={styles.BalanceSub}>
            {budgetFt > 0 ? "Havi keretből megmaradt összeg" : "Nincs keret beállítva"}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div className={styles.BalanceSub}>{trendText}</div>
          </div>

          <MiniAreaChart values={seriesValues} />
        </div>

        {/* JOBB: Kategóriák (multi-donut) */}
        <div className={`${styles.Panel} ${styles.RightTall}`}>
          <div className={styles.Header}>
            <div className={styles.Title}>Kategóriák</div>
            <span className={styles.LiveDot} />
          </div>

          <div className={styles.CategoryWrap}>
            <MultiDonut items={categoryStats} centerText={centerText} />

            <div className={styles.CategoryList}>
              {categoryStats.map((c) => (
                <div key={c.name} className={styles.CategoryRow}>
                  <div className={styles.CategoryName}>
                    <span>{c.emoji ?? "📌"}</span>
                    <span>{c.name}</span>
                  </div>
                  <div className={styles.CategoryPct}>{c.pct}%</div>
                </div>
              ))}

              {categoryStats.length === 0 && (
                <div style={{ opacity: 0.7 }}>Még nincs elég adat.</div>
              )}
            </div>
          </div>
        </div>

        {/* BAL ALSÓ: Legutóbbi költések */}
        <div className={`${styles.Panel} ${styles.LeftBottom}`}>
          <div className={styles.Header}>
            <div className={styles.Title}>Legutóbbi költések</div>
            <span className={styles.LiveDot} />
          </div>

          <div className={styles.RecentList}>
            {recent.slice(0, 3).map((r, idx) => (
              <div key={idx} className={styles.RecentItem}>
                <strong>{r.title}</strong>
                <span className={styles.RecentAmount}>
                  -{Number(r.amount || 0).toLocaleString("hu-HU")} Ft
                </span>
              </div>
            ))}

            {recent.length === 0 && (
              <div style={{ opacity: 0.7 }}>Nincs még rögzített költés.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== MINI AREA CHART (SVG) ===================== */
function MiniAreaChart({ values }) {
  const w = 640;
  const h = 170;
  const pad = 14;

  const safe = Array.isArray(values) && values.length ? values : [0, 0, 0, 0, 0];
  const max = Math.max(...safe, 1);
  const min = Math.min(...safe, 0);

  const xStep = (w - pad * 2) / Math.max(safe.length - 1, 1);
  const scaleY = (v) => {
    const t = (v - min) / (max - min || 1);
    return pad + (1 - t) * (h - pad * 2);
  };

  const points = safe.map((v, i) => ({
    x: pad + i * xStep,
    y: scaleY(v),
  }));

  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");

  const areaD = `${lineD} L ${(pad + (safe.length - 1) * xStep).toFixed(
    2
  )} ${(h - pad).toFixed(2)} L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <div className={styles.ChartWrap}>
      <svg className={styles.ChartSvg} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="heroFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(74,222,128)" stopOpacity="0.30" />
            <stop offset="100%" stopColor="rgb(74,222,128)" stopOpacity="0" />
          </linearGradient>

          <filter id="heroGlow">
            <feGaussianBlur stdDeviation="2.1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className={styles.ChartGrid}>
          <line x1="0" y1={h - pad} x2={w} y2={h - pad} />
          <line x1="0" y1={h / 2} x2={w} y2={h / 2} />
          <line x1="0" y1={pad} x2={w} y2={pad} />
        </g>

        <path d={areaD} fill="url(#heroFill)" />
        <path d={lineD} stroke="#4ade80" strokeWidth="2.8" fill="none" filter="url(#heroGlow)" />
      </svg>
    </div>
  );
}

/* ===================== MULTI DONUT ===================== */
function MultiDonut({ items = [], centerText = "0%" }) {
  const raw = (items || [])
    .map((x) => ({ name: x.name, pct: Number(x.pct || 0) }))
    .filter((x) => x.pct > 0);

  const total = raw.reduce((s, x) => s + x.pct, 0) || 0;

  const data =
    total === 0 ? [{ name: "Empty", pct: 100 }] : raw.map((x) => ({ ...x, pct: (x.pct / total) * 100 }));

  const colors = {
    Food: "#4ade80",
    Transport: "#22c55e",
    Shopping: "#34d399",
    Bills: "#16a34a",
    General: "#86efac",
    Empty: "rgba(255,255,255,0.14)",
  };

  const radius = 40;
  const stroke = 10;
  const cx = 60;
  const cy = 60;

  const C = 2 * Math.PI * radius;
  const gap = 2.2;

  let offset = 0;

  return (
    <div className={styles.DonutWrap} aria-hidden="true">
      <svg width="160" height="160" viewBox="0 0 120 120">
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="rgba(255,255,255,0.10)"
          strokeWidth={stroke}
          fill="none"
        />

        <g transform="rotate(-90 60 60)">
          {data.map((seg) => {
            const segLen = (seg.pct / 100) * C;

            if (segLen <= gap + 0.5) {
              offset += segLen;
              return null;
            }

            const dash = Math.max(0, segLen - gap);
            const dasharray = `${dash} ${C - dash}`;
            const dashoffset = -offset;

            offset += segLen;

            const strokeColor = colors[seg.name] ?? "#4ade80";

            return (
              <circle
                key={seg.name}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={strokeColor}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
              />
            );
          })}
        </g>
      </svg>

      <div className={styles.DonutCenter}>{centerText}</div>
    </div>
  );
}
