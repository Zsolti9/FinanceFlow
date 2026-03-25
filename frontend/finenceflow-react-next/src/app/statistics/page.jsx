"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "../components/AppLogo";
import styles from "./statistics.module.css";
import useCurrencyDisplay from "../hooks/useCurrencyDisplay";

const API_BASE = "https://localhost:7183";
const DATA_URL = `${API_BASE}/api/data`;
const BUDGETS_URL = `${API_BASE}/api/budgets/categories`;

const DEFAULT_PLAN = {
  Food: 80000,
  Transport: 60000,
  Shopping: 40000,
  Bills: 30000,
  General: 0,
};

const CATEGORY_ALIASES = {
  food: "Food",
  transport: "Transport",
  shopping: "Shopping",
  bills: "Bills",
};
export default function StatisticsPage() {
  const router = useRouter();
  const { formatFromHuf } = useCurrencyDisplay();

  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [savingBudgets, setSavingBudgets] = useState(false);

  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // ✅ DB-ből jön majd
  const [plan, setPlan] = useState(DEFAULT_PLAN);

  useEffect(() => setIsClient(true), []);

  const token = useMemo(() => {
    if (!isClient) return null;
    return localStorage.getItem("token");
  }, [isClient]);

  // auth
  useEffect(() => {
    if (!isClient) return;
    const t = localStorage.getItem("token");
    if (!t) router.replace("/login");
  }, [isClient, router]);

  // theme
  useEffect(() => {
    if (!isClient) return;
    setIsDarkMode(localStorage.getItem("darkMode") !== "false");
  }, [isClient]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  // aktuális év/hó
  const now = useMemo(() => new Date(), []);
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1..12
  const monthIdx0 = now.getMonth(); // 0..11

  async function loadExpenses() {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(DATA_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      if (!res.ok) {
        setError(`Nem sikerült betölteni az adatokat. (${res.status})`);
        setExpenses([]);
        return;
      }

      const data = JSON.parse(text);
      setExpenses(
        (data ?? []).map((x) => ({
          id: x.id,
          title: x.name,
          amount: Number(x.amount || 0),
          category: x.category ?? "General",
          createdAt: x.createdAt ?? x.created_at ?? null,
        }))
      );
    } catch (e) {
      console.error(e);
      setError("Szerver hiba (expenses).");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }

  // ✅ DB-ből budget betöltés
  async function loadBudgets() {
    if (!token) return;
    setLoadingBudgets(true);

    try {
      const res = await fetch(`${BUDGETS_URL}?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ha nincs még mentve, lehet üres lista
      if (!res.ok) {
        // nem dobjuk el a defaultot, csak jelzünk
        console.warn("Budgets load failed:", res.status);
        return;
      }

      const data = await res.json();
      const items = Array.isArray(data?.items) ? data.items : [];

      // merge default + db
      const next = { ...DEFAULT_PLAN };
      for (const it of items) {
        if (!it?.category) continue;
        next[it.category] = Number(it.amount || 0);
      }
      setPlan(next);
    } catch (e) {
      console.error(e);
      // default marad
    } finally {
      setLoadingBudgets(false);
    }
  }

  // ✅ DB-be mentés (bulk)
  async function saveBudgets() {
    if (!token) return;

    setSavingBudgets(true);
    setError("");

    try {
      const items = Object.entries(plan).map(([category, amount]) => ({
        category,
        amount: Number(amount || 0),
      }));

      const res = await fetch(`${BUDGETS_URL}?year=${year}&month=${month}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        console.error("SAVE BUDGETS ERROR:", res.status, t);
        setError("Nem sikerült elmenteni a kereteket.");
        return;
      }

      showToast("✅ Keretek elmentve.");
    } catch (e) {
      console.error(e);
      setError("Szerver hiba (budgets save).");
    } finally {
      setSavingBudgets(false);
    }
  }

  useEffect(() => {
    if (!isClient || !token) return;
    loadExpenses();
    loadBudgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, token]);

  // aktuális hónap költései
  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!e.createdAt) return false;
      const d = new Date(e.createdAt);
      return d.getFullYear() === year && d.getMonth() === monthIdx0;
    });
  }, [expenses, year, monthIdx0]);

  const entryCount = monthExpenses.length;

  const spentByCategory = useMemo(() => {
    const totals = {};
    for (const e of monthExpenses) {
      const cat = normalizeCategory(e.category);
      totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    }
    return totals;
  }, [monthExpenses]);

  const planRows = useMemo(() => {
    const emoji = {
      Food: "🍔",
      Transport: "🚗",
      Shopping: "🛍️",
      Bills: "🏠",
    };

    // plan kulcsok sorrendje
    const order = ["Food", "Transport", "Shopping", "Bills"];

    return order.map((name) => {
      const budget = Math.max(0, Number(plan[name] || 0));
      const spent = Math.max(0, Number(spentByCategory[name] || 0));
      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;

      return {
        name,
        emoji: emoji[name] ?? "📌",
        budget,
        spent,
        pct,
        isOverBudget: budget > 0 && spent > budget,
      };
    });
  }, [plan, spentByCategory]);

  const monthlySum = useMemo(() => {
    return monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  }, [monthExpenses]);

  const dailySeries = useMemo(() => {
    return buildDailySeries(monthExpenses, year, monthIdx0);
  }, [monthExpenses, year, monthIdx0]);

  const qLabel = useMemo(() => {
    const q = Math.floor(monthIdx0 / 3) + 1;
    return `${year}`;
  }, [year, monthIdx0]);

  return (
    <div className={`${styles.Page} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.TopBar}>
        <div className={styles.TopLeft}>
          <AppLogo size="sm" href="/home" />
        </div>

        <button className={styles.BackBtn} onClick={() => router.push("/home")}>
          ← Vissza
        </button>
      </div>

      <div className={styles.Shell}>
        {toast && <div className={styles.Toast}>{toast}</div>}
        {error && <div className={styles.Error}>❌ {error}</div>}

        <div className={styles.Grid}>
          {/* BAL FELSŐ */}
          <div className={`${styles.Card} ${styles.LeftTop}`}>
            <div className={styles.CardHeader}>
              <h2 className={styles.CardTitle}>Statisztikák</h2>
              <span className={styles.LiveDot} />
            </div>

            <div className={styles.StatRow}>
              <div className={styles.ChartBox}>
                {loading ? (
                  <div className={styles.Loading}>Betöltés…</div>
                ) : (
                  <MiniAreaChart values={dailySeries} />
                )}
              </div>

              <div className={styles.StatBig}>
                <div className={styles.BigNumber}>{entryCount}</div>
                <div className={styles.BigLabel}>
                  bejegyzés{" "}
                  <span className={styles.BigAccent}>
                    {now.toLocaleDateString("hu-HU", { month: "long" })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* JOBB (Költségterv) */}
          <div className={`${styles.Card} ${styles.RightTall}`}>
            <div className={styles.CardHeader}>
              <h2 className={styles.CardTitle}>Költségterv {qLabel}</h2>
              <span className={styles.LiveDot} />
            </div>

            <div className={styles.PlanSubtitle}>
              Sávok: költés / keret (aktuális hónap)
            </div>

            {loadingBudgets && (
              <div className={styles.Loading} style={{ marginTop: 8 }}>
                Keretek betöltése…
              </div>
            )}

            <div className={styles.PlanList}>
              {planRows.map((c) => (
                <div key={c.name} className={styles.PlanRow}>
                  <div className={styles.PlanLeft}>
                    <span className={styles.PlanEmoji}>{c.emoji}</span>
                    <span className={styles.PlanName}>{c.name}</span>
                  </div>

                  <div
                    className={styles.PlanBarWrap}title={`${c.pct}% • Költés: ${formatFromHuf(c.spent)} / Keret: ${formatFromHuf(
                      c.budget
                    )} `}
                  >
                    <div
                      className={`${styles.PlanBar} ${c.isOverBudget ? styles.PlanBarOver : ""}`}
                      style={{ width: `${c.pct}%` }}
                    />
                  </div>

                  <div className={styles.PlanRight}>
                    <div className={styles.PlanAmount}>{formatFromHuf(c.budget)}</div>
                    <div className={styles.PlanSpent}>Költés: {formatFromHuf(c.spent)}</div>
                    <div className={styles.PlanPct}>{c.pct}% felhasználva</div>
                  </div>

                  <input
                    className={styles.PlanInput}
                    type="number"
                    min="0"
                    value={c.budget}
                    onChange={(e) =>
                      setPlan((prev) => ({
                        ...prev,
                        [c.name]: e.target.value === "" ? 0 : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              ))}
            </div>

            <div className={styles.PlanActions}>
              <button className={styles.SaveBtn} onClick={saveBudgets} disabled={savingBudgets}>
                {savingBudgets ? "Mentés…" : "💾 Mentés"}
              </button>
            </div>
          </div>

          {/* BAL ALSÓ */}
          <div className={`${styles.Card} ${styles.LeftBottom}`}>
            <div className={styles.CardHeader}>
              <div className={styles.SubTitle}>Költési összeg</div>
              <span className={styles.LiveDot} />
            </div>

            <div className={styles.InfoLine}>
              <span>Havi költés összesen:</span>
              <strong>{formatFromHuf(monthlySum)}</strong>
            </div>

            <div className={styles.Hint}>
              (Később ide jöhet bevétel / egyenleg / előző hónap összehasonlítás.)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== HELPERS ===================== */


function normalizeCategory(category) {
  const key = String(category || "General").trim().toLowerCase();
  return CATEGORY_ALIASES[key] ?? "General";
}

function buildDailySeries(list, y, m0) {
  const daysInMonth = new Date(y, m0 + 1, 0).getDate();
  const perDay = Array(daysInMonth).fill(0);

  for (const e of list) {
    if (!e.createdAt) continue;
    const d = new Date(e.createdAt);
    perDay[d.getDate() - 1] += Number(e.amount || 0);
  }

  let sum = 0;
  return perDay.map((v) => (sum += v));
}

function MiniAreaChart({ values }) {
  const w = 640;
  const h = 210;
  const pad = 16;

  const safe =
    Array.isArray(values) && values.length ? values : [0, 0, 0, 0, 0];

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
    .map(
      (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    )
    .join(" ");

  const areaD = `${lineD} L ${(pad + (safe.length - 1) * xStep).toFixed(
    2
  )} ${(h - pad).toFixed(2)} L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <svg
      className={styles.ChartSvg}
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="statFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="rgb(74,222,128)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="rgb(74,222,128)" stopOpacity="0" />
        </linearGradient>

        <filter id="statGlow">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
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

      <path d={areaD} fill="url(#statFill)" />
      <path d={lineD} className={styles.ChartLine} filter="url(#statGlow)" />
    </svg>
  );
}
