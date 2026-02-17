"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import DashboardHero from "../components/DashboardHero";
import AppLogo from "../components/AppLogo";

import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();

  const API_BASE = "https://localhost:7183";
  const DATA_URL = `${API_BASE}/api/data`;

  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [budget, setBudget] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  useEffect(() => setIsClient(true), []);

  const token = useMemo(() => {
    if (!isClient) return null;
    return localStorage.getItem("token");
  }, [isClient]);

  // Budget load
  useEffect(() => {
    if (!isClient) return;
    const b = Number(localStorage.getItem("budget") || 0);
    setBudget(Number.isFinite(b) ? b : 0);
  }, [isClient]);

  function saveBudget() {
    const b = Number(budgetInput);
    if (!Number.isFinite(b) || b < 0) {
      setError("A keret legyen 0 vagy pozitív szám!");
      return;
    }
    setBudget(b);
    localStorage.setItem("budget", String(b));
    setBudgetInput("");
    setShowBudgetModal(false);
  }

  /* AUTH */
  useEffect(() => {
    if (!isClient) return;

    const storedUser = localStorage.getItem("user");
    const t = localStorage.getItem("token");

    if (!storedUser || !t) {
      router.replace("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
      router.replace("/login");
    }
  }, [isClient, router]);

  /* THEME LOAD */
  useEffect(() => {
    if (!isClient) return;
    setIsDarkMode(localStorage.getItem("darkMode") !== "false");
  }, [isClient]);

  /* NAVBAR SCROLL */
  useEffect(() => {
    function handleScroll() {
      setShowNavbar(window.scrollY === 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ---- Helpers ----
  function calcMonthlySpend(list) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();

    return list
      .filter(
        (e) =>
          e.createdAt &&
          new Date(e.createdAt).getFullYear() === y &&
          new Date(e.createdAt).getMonth() === m
      )
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  }

  function getCategoryStats(list) {
    const totals = {};
    for (const e of list) {
      const cat = e.category || "General";
      totals[cat] = (totals[cat] || 0) + Number(e.amount || 0);
    }
    const all = Object.values(totals).reduce((a, b) => a + b, 0) || 0;

    const emoji = {
      Food: "🍔",
      Transport: "🚗",
      Shopping: "🛍️",
      Bills: "🧾",
      General: "📌",
    };

    return Object.entries(totals)
      .map(([name, sum]) => ({
        name,
        sum,
        pct: all === 0 ? 0 : Math.round((sum / all) * 100),
        emoji: emoji[name] ?? "📌",
      }))
      .sort((a, b) => b.sum - a.sum)
      .slice(0, 4);
  }

  async function loadExpenses() {
    if (!token) return;

    setLoadingExpenses(true);
    setError("");

    try {
      const res = await fetch(DATA_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("LOAD EXPENSES ERROR:", res.status, text);
        setError(`Nem sikerült betölteni a költéseket. (${res.status})`);
        setExpenses([]);
        return;
      }

      const data = JSON.parse(text);

      setExpenses(
        (data ?? []).map((x) => ({
          id: x.id,
          title: x.name,
          amount: x.amount,
          category: x.category ?? "General",
          createdAt: x.createdAt ?? x.created_at ?? null,
        }))
      );
    } catch (e) {
      console.error(e);
      setError("Szerver hiba.");
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  }

  useEffect(() => {
    if (!isClient || !user) return;
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user]);

  // user refresh
  useEffect(() => {
    if (!isClient || !token) return;

    fetch(`${API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      })
      .catch((err) => console.error("LOAD USER ERROR:", err));
  }, [isClient, token, API_BASE]);

  async function addExpense() {
    setError("");

    if (!title.trim() || !amount) {
      setError("Adj meg nevet és összeget!");
      return;
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Az összeg legyen pozitív szám!");
      return;
    }

    if (!token) {
      router.replace("/login");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(DATA_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: title.trim(),
          amount: amountNum,
          category,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        let msg = "Nem sikerült menteni a költést.";
        try {
          const err = JSON.parse(text);
          if (err.message) {
            msg = `${err.message} (Maradék: ${err.remaining?.toLocaleString(
              "hu-HU"
            )} Ft)`;
          }
        } catch {}
        setError(msg);
        return;
      }

      setTitle("");
      setAmount("");
      setCategory("Food");
      setShowModal(false);

      await loadExpenses();
    } catch (e) {
      console.error(e);
      setError("Szerver hiba mentés közben.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteExpense(id) {
    setError("");
    if (!token) return;

    try {
      const res = await fetch(`${DATA_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      if (!res.ok) {
        console.error("DELETE ERROR:", res.status, text);
        setError(`Nem sikerült törölni. (${res.status})`);
        return;
      }

      setExpenses((prev) => prev.filter((x) => x.id !== id));
    } catch (e) {
      console.error(e);
      setError("Szerver hiba törlés közben.");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!isClient || !user) {
    return <div className={styles.loading}>Betöltés...</div>;
  }

  const displayName =
    user?.userName ||
    user?.displayName ||
    user?.DisplayName ||
    user?.email?.split("@")[0];

  const monthlySpend = calcMonthlySpend(expenses);
  const remaining = budget - monthlySpend; // ✅ ez kell a herohoz

  const categoryStats = getCategoryStats(expenses);

  const recentSorted = [...expenses].sort(
    (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
  );

  // A te régi kártyáidhoz (lent)
  const remainingForBudgetCard = Math.max(0, budget - monthlySpend);
  const usedPct =
    budget > 0 ? Math.min(100, Math.round((monthlySpend / budget) * 100)) : 0;

  return (
    <div
      className={`${styles.HomeBackground} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      <h1 className={styles.Greeting}>Szia, {displayName} 👋</h1>

      {/* NAVBAR */}
      <nav
        className={`${styles.HomeNavbar} ${
          showNavbar ? styles.NavVisible : styles.NavHidden
        }`}
      >
        <div className={styles.HomeNavLeft}>
          <AppLogo size="sm" href="/" />
        </div>
      </nav>

      {/* HAMBURGER */}
      <div
        className={styles.FloatingBurger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
      </div>

      {menuOpen && (
        <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* SIDE MENU */}
      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        <span onClick={() => router.push("/profile")}>👤 Profil</span>
        <span onClick={() => router.push("/statistics")}>📝 Statisztikák</span>
        <span onClick={() => router.push("/settings")}>⚙️ Beállítások</span>

        <span className={styles.Logout} onClick={logout}>
          🚪 Kijelentkezés
        </span>
      </div>

      {/* ✅ HERO DASHBOARD: itt jelenik meg a "keretből maradt" */}
      <DashboardHero
        remainingFt={remaining}
        budgetFt={budget}
        categoryStats={categoryStats}
        recent={recentSorted.slice(0, 3).map((e) => ({
          title: e.title,
          amount: e.amount,
        }))}
        seriesValues={buildDailyDaily(expenses)}
        trendText="+12% az előző hónaphoz képest"
      />

      {/* CONTENT (a te meglévő dashboard részed lent marad) */}
      <div className={styles.HomeContent}>
        <div className={styles.SplitGrid}>
          {/* LEFT */}
          <div className={styles.LeftPanel}>
            <div className={styles.CardGrid}>
              {/* Havi keret */}
              <div className={styles.DashCard}>
                <div className={styles.CardTop}>
                  <span className={styles.CardTitle}>Havi keret</span>
                  <span className={styles.LiveDot} />
                </div>

                <div className={styles.BigValue}>
                  {budget > 0
                    ? `${budget.toLocaleString("hu-HU")} Ft`
                    : "Nincs beállítva"}
                </div>

                <div className={styles.SubMuted}>
                  Maradék:{" "}
                  <strong>
                    {remainingForBudgetCard.toLocaleString("hu-HU")} Ft
                  </strong>{" "}
                  • Felhasznált: <strong>{usedPct}%</strong>
                </div>

                <div className={styles.ProgressBar}>
                  <div
                    className={styles.ProgressFill}
                    style={{ width: `${usedPct}%` }}
                  />
                </div>

                <button
                  className={styles.SetBudgetBtn}
                  onClick={() => setShowBudgetModal(true)}
                >
                  Keret beállítása
                </button>
              </div>

              {/* Havi költés */}
              <div className={styles.DashCard}>
                <div className={styles.CardTop}>
                  <span className={styles.CardTitle}>Havi költés</span>
                  <span className={styles.LiveDot} />
                </div>

                <div className={styles.BigValue}>
                  {monthlySpend.toLocaleString("hu-HU")} Ft
                </div>

                <div className={styles.SubMuted}>
                  (Az aktuális hónapban eddig elköltött összeg)
                </div>

                <MiniAreaChart values={buildDailySeries(expenses)} />
              </div>

              {/*<div className={styles.DashCard}>
                <div className={styles.CardTop}>
                  <span className={styles.CardTitle}>Kategóriák</span>
                  <span className={styles.LiveDot} />
                </div>

                <div className={styles.CategoryList}>
                  {categoryStats.map((c) => (
                    <div key={c.name} className={styles.CategoryRow}>
                      <span className={styles.CategoryName}>
                        {c.emoji} {c.name}
                      </span>
                      <span className={styles.CategoryPct}>{c.pct}%</span>
                    </div>
                  ))}

                  {expenses.length === 0 && (
                    <div className={styles.EmptyHint}>Még nincs elég adat.</div>
                  )}
                </div>
              </div>*/}
              
            </div>

            {/* Legutóbbi költések */}
            <div className={styles.DashCard}>
              <div className={styles.CardTop}>
                <span className={styles.CardTitle}>Legutóbbi költések</span>
                <span className={styles.LiveDot} />
              </div>

              <div className={styles.RecentList}>
                {recentSorted.slice(0, 5).map((e) => (
                  <div key={e.id} className={styles.RecentItem}>
                    <div className={styles.RecentLeft}>
                      <strong>{e.title}</strong>
                      <small>
                        {e.createdAt
                          ? new Date(e.createdAt).toLocaleDateString("hu-HU", {
                              month: "short",
                              day: "2-digit",
                            })
                          : ""}
                        {" • "}
                        {e.category}
                      </small>
                    </div>
                    <span className={styles.RecentAmount}>
                      -{Number(e.amount || 0).toLocaleString("hu-HU")} Ft
                    </span>
                  </div>
                ))}

                {expenses.length === 0 && (
                  <div className={styles.EmptyHint}>
                    Nincs még rögzített költés.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT: EXPENSE MANAGER */}
          <div className={styles.RightPanel}>
            <div className={styles.ManagerCard}>
              <div className={styles.ManagerHeader}>
                <div>
                  <h2 className={styles.ManagerTitle}>Költéseid</h2>
                  <p className={styles.ManagerSub}>
                    Adj hozzá új költést és kezeld a listát.
                  </p>
                </div>

                <button
                  className={styles.AddExpenseBtn}
                  onClick={() => setShowModal(true)}
                >
                  + Új költés
                </button>
              </div>

              {error && <div className={styles.ErrorMessage}>❌ {error}</div>}

              {!loadingExpenses && expenses.length > 0 && (
                <div className={styles.ExpenseList}>
                  {expenses.map((e) => (
                    <div key={e.id} className={styles.ExpenseItem}>
                      <div>
                        <strong>{e.title}</strong>
                        <small>
                          {e.createdAt
                            ? new Date(e.createdAt).toLocaleString("hu-HU", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                          {" • "}
                          {e.category}
                        </small>
                      </div>

                      <div className={styles.ExpenseRight}>
                        <span className={styles.ExpenseAmount}>
                          -{Number(e.amount || 0).toLocaleString("hu-HU")} Ft
                        </span>

                        <button
                          className={styles.DeleteBtn}
                          onClick={() => deleteExpense(e.id)}
                          title="Törlés"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loadingExpenses && expenses.length === 0 && (
                <div className={styles.EmptyHint}>
                  Nincs még rögzített költés.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: új költés */}
      {showModal && (
        <div className={styles.ModalOverlay} onClick={() => setShowModal(false)}>
          <div
            className={styles.AddExpenseModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.CloseModalBtn}
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2>Új költés</h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mire költöttél?"
            />

            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="Összeg (Ft)"
            />

            <select
              className={styles.Select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Bills</option>
              <option>General</option>
            </select>

            <button
              className={styles.SaveExpenseBtn}
              onClick={addExpense}
              disabled={saving}
            >
              {saving ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </div>
      )}

      {/* MODAL: keret */}
      {showBudgetModal && (
        <div
          className={styles.ModalOverlay}
          onClick={() => setShowBudgetModal(false)}
        >
          <div
            className={styles.AddExpenseModal}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.CloseModalBtn}
              onClick={() => setShowBudgetModal(false)}
            >
              ✕
            </button>
            <h2>Havi keret beállítása</h2>

            <input
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              type="number"
              placeholder="Keret (Ft)"
            />

            <button className={styles.SaveExpenseBtn} onClick={saveBudget}>
              Mentés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===================== CHART HELPERS ===================== */

// Hero-hoz: napi érték (nem kumulatív) - szebb görbe
function buildDailyDaily(expenses) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();

  const perDay = Array(daysInMonth).fill(0);

  for (const e of expenses) {
    if (!e.createdAt) continue;
    const d = new Date(e.createdAt);
    if (d.getFullYear() !== y || d.getMonth() !== m) continue;
    perDay[d.getDate() - 1] += Number(e.amount || 0);
  }

  return perDay;
}

// A te lentebbi chartodhoz (kumulatív)
function buildDailySeries(expenses) {
  const perDay = buildDailyDaily(expenses);
  let sum = 0;
  return perDay.map((v) => (sum += v));
}

// Home kártya chartja (a te meglévő CSS-edhez)
function MiniAreaChart({ values }) {
  const w = 640;
  const h = 180;
  const pad = 14;

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
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    )
    .join(" ");

  const areaD = `${lineD} L ${(pad + (safe.length - 1) * xStep).toFixed(
    2
  )} ${(h - pad).toFixed(2)} L ${pad.toFixed(2)} ${(h - pad).toFixed(2)} Z`;

  return (
    <div className={styles.ChartWrap}>
      <svg
        className={styles.ChartSvg}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="fillGreen" x1="0" x2="0" y1="0" y2="1">
            <stop
              offset="0%"
              stopColor="rgb(74,222,128)"
              stopOpacity="0.35"
            />
            <stop
              offset="100%"
              stopColor="rgb(74,222,128)"
              stopOpacity="0"
            />
          </linearGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className={styles.ChartGrid}>
          <line x1="0" y1={h - pad} x2={w} y2={h - pad} />
          <line x1="0" y1={h / 2} x2={w} y2={h / 2} />
          <line x1="0" y1={pad} x2={w} y2={pad} />
        </g>

        <path d={areaD} className={styles.ChartArea} />
        <path d={lineD} className={styles.ChartLine} filter="url(#glow)" />
      </svg>
    </div>
  );
}
