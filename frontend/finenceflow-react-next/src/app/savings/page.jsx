"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useCurrencyDisplay from "../hooks/useCurrencyDisplay";

import AppLogo from "../components/AppLogo";
import styles from "./savings.module.css";

const API_BASE = "https://localhost:7183";
const SAVINGS_URL = `${API_BASE}/api/savings`;

export default function SavingsPage() {
  const router = useRouter();
  const { formatFromHuf } = useCurrencyDisplay();


  const [isDarkMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("darkMode") !== "false";
  });

  const [token] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("token") || "";
  });

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [depositLoadingId, setDepositLoadingId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [depositInputs, setDepositInputs] = useState({});

  const loadGoals = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(SAVINGS_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError("Nem sikerült betölteni a megtakarításokat.");
        setGoals([]);
        return;
      }

      const data = await res.json();
      setGoals(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("Szerver hiba történt.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    loadGoals();
  }, [token, router, loadGoals]);

  const totalTarget = useMemo(
    () => goals.reduce((sum, item) => sum + Number(item.targetAmount || 0), 0),
    [goals]
  );

  const totalSaved = useMemo(
    () => goals.reduce((sum, item) => sum + Number(item.savedAmount || 0), 0),
    [goals]
  );

  async function handleAddGoal(e) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !targetAmount) {
      setError("Adj meg egy nevet és egy cél összeget.");
      return;
    }

    const amount = Number(targetAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("A cél összeg legyen pozitív szám.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(SAVINGS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), targetAmount: amount }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("ADD SAVING ERROR", res.status, text);
        setError("Nem sikerült létrehozni a megtakarítást.");
        return;
      }

      const created = await res.json();
      setGoals((prev) => [created, ...prev]);
      setName("");
      setTargetAmount("");
    } catch (e) {
      console.error(e);
      setError("Szerver hiba történt.");
    } finally {
      setSaving(false);
    }
  }

  function subtractFromMonthlyBudget(amountToSubtract) {
    if (typeof window === "undefined") return;

    const currentBudget = Number(localStorage.getItem("budget") || 0);
    if (!Number.isFinite(currentBudget)) return;

    const nextBudget = Math.max(0, currentBudget - amountToSubtract);
    localStorage.setItem("budget", String(nextBudget));
  }

  async function handleAddDeposit(goalId) {
    const raw = depositInputs[goalId] ?? "";
    const amount = Number(raw);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("A befizetés összege legyen pozitív szám.");
      return;
    }

    setError("");
    setDepositLoadingId(goalId);

    try {
      const res = await fetch(`${SAVINGS_URL}/${goalId}/deposit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error("DEPOSIT ERROR", res.status, text);
        setError("Nem sikerült pénzt hozzáadni a megtakarításhoz.");
        return;
      }

      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updated : g)));
      setDepositInputs((prev) => ({ ...prev, [goalId]: "" }));
      subtractFromMonthlyBudget(amount);
    } catch (e) {
      console.error(e);
      setError("Szerver hiba történt.");
    } finally {
      setDepositLoadingId(null);
    }
  }

  async function handleDeleteGoal(id) {
    setError("");

    try {
      const res = await fetch(`${SAVINGS_URL}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setError("Nem sikerült törölni a megtakarítást.");
        return;
      }

      setGoals((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error(e);
      setError("Szerver hiba történt.");
    }
  }

  return (
    <div className={`${styles.Page} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.TopBar}>
        <AppLogo size="sm" href="/home" />
        <button className={styles.BackBtn} onClick={() => router.push("/home")}>
          ← Vissza
        </button>
      </div>

      <main className={styles.Content}>
        <section className={styles.Card}>
          <h1 className={styles.Title}>Megtakarítások</h1>
          <p className={styles.Subtitle}>
            Hozz létre célt, majd töltsd fel pénzzel. A progress bar mutatja az
            aktuális állapotot.
          </p>

          <form onSubmit={handleAddGoal} className={styles.Form}>
            <label className={styles.Label}>
              Név
              <input
                type="text"
                className={styles.Input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pl.: Nyaralás"
              />
            </label>

            <label className={styles.Label}>
              Cél összeg (alap: Ft)
              <input
                type="number"
                min="1"
                step="1"
                className={styles.Input}
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="Pl.: 350000"
              />
            </label>

            {error && <p className={styles.Error}>{error}</p>}

            <button type="submit" className={styles.AddBtn} disabled={saving}>
              {saving ? "Mentés..." : "+ Megtakarítás hozzáadása"}
            </button>
          </form>
        </section>

        <section className={styles.Card}>
          <div className={styles.ListHeader}>
            <h2 className={styles.ListTitle}>Célok</h2>
            <span className={styles.Total}>
              Összesen: {formatFromHuf(totalSaved)} / {formatFromHuf(totalTarget)}
            </span>
          </div>

          {loading ? (
            <p className={styles.Empty}>Betöltés...</p>
          ) : goals.length === 0 ? (
            <p className={styles.Empty}>Még nincs rögzített megtakarítási cél.</p>
          ) : (
            <ul className={styles.List}>
              {goals.map((goal) => {
                const progress =
                  goal.targetAmount > 0
                    ? Math.min(100, Math.round((goal.savedAmount / goal.targetAmount) * 100))
                    : 0;

                return (
                  <li key={goal.id} className={styles.Item}>
                    <div className={styles.ItemMain}>
                      <p className={styles.ItemName}>{goal.name}</p>
                      <p className={styles.ItemAmount}>
                         {formatFromHuf(goal.savedAmount)} / {formatFromHuf(goal.targetAmount)}
                      </p>

                      <div className={styles.ProgressTrack}>
                        <div
                          className={styles.ProgressFill}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className={styles.ProgressLabel}>{progress}% teljesítve</p>
                    </div>

                    <div className={styles.Actions}>
                      <div className={styles.DepositRow}>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          className={styles.DepositInput}
                          value={depositInputs[goal.id] ?? ""}
                          onChange={(e) =>
                            setDepositInputs((prev) => ({
                              ...prev,
                              [goal.id]: e.target.value,
                            }))
                          }
                          placeholder="Összeg"
                        />
                        <button
                          type="button"
                          className={styles.DepositBtn}
                          onClick={() => handleAddDeposit(goal.id)}
                          disabled={depositLoadingId === goal.id}
                        >
                          {depositLoadingId === goal.id ? "..." : "+ Pénz"}
                        </button>
                      </div>

                      <button
                        type="button"
                        className={styles.DeleteBtn}
                        onClick={() => handleDeleteGoal(goal.id)}
                      >
                        Törlés
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
