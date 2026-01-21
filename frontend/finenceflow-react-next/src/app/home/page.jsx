"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();

  // ✅ Backend URL-ek
  const API_BASE = "https://localhost:7183";
  const DATA_URL = `${API_BASE}/api/data`;

  // ✅ Auth + client
  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // ✅ UI állapotok
  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // ✅ Költségek
  const [expenses, setExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  // ✅ Client flag
  useEffect(() => setIsClient(true), []);

  // ✅ Token
  const token = useMemo(() => {
    if (!isClient) return null;
    return localStorage.getItem("token");
  }, [isClient]);

  // ✅ Auth check
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

  // ✅ Theme load
  useEffect(() => {
    if (!isClient) return;
    const darkMode = localStorage.getItem("darkMode") !== "false";
    setIsDarkMode(darkMode);
  }, [isClient]);

  // ✅ Theme save
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode, isClient]);

  // ✅ Navbar hide/show (csak tetején látszik)
  useEffect(() => {
    function handleScroll() {
      setShowNavbar(window.scrollY === 0);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Költségek betöltése backendből
  async function loadExpenses() {
    if (!token) return;

    setLoadingExpenses(true);
    setError("");

    try {
      const res = await fetch(DATA_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("LOAD EXPENSES ERROR:", res.status, text);
        setError(`Nem sikerült betölteni a költéseket. (${res.status})`);
        setExpenses([]);
        return;
      }

      const data = JSON.parse(text);

      // backend Expense -> UI modell
      const mapped = data.map((x) => ({
        id: x.id,
        title: x.name,
        amount: x.amount,
        category: x.category ?? "General",
        createdAt: x.createdAt ?? null,
      }));

      setExpenses(mapped);
    } catch (e) {
      console.error(e);
      setError("Szerver hiba a költések betöltésekor.");
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  }

  // ✅ Első betöltés
  useEffect(() => {
    if (!isClient || !user) return;
    loadExpenses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, user]);

  // ✅ Új költés hozzáadása (POST)
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
          // category-t csak akkor küldd, ha backendben is van mező rá
          // category: category,
        }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("ADD EXPENSE ERROR:", res.status, text);
        setError(`Nem sikerült menteni a költést. (${res.status})`);
        return;
      }

      // Modal reset + zár
      setTitle("");
      setAmount("");
      setCategory("Food");
      setShowModal(false);

      // Lista frissítés
      await loadExpenses();
    } catch (e) {
      console.error(e);
      setError("Szerver hiba mentés közben.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Törlés (DELETE)
  async function deleteExpense(id) {
    setError("");
    if (!token) return;

    try {
      const res = await fetch(`${DATA_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  function toggleTheme() {
    setIsDarkMode((v) => !v);
  }

  if (!isClient || !user) {
    return (
      <div className={styles.loading}>
        <div>Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.HomeBackground} ${isDarkMode ? styles.dark : styles.light}`}>
      <h1 className={styles.Greeting}>
        Szia, {user?.displayName || user?.DisplayName || user?.name || user?.email?.split("@")[0]} 👋
      </h1>

      {/* NAVBAR */}
      <nav className={`${styles.HomeNavbar} ${showNavbar ? styles.NavVisible : styles.NavHidden}`}>
        <div className={styles.HomeNavLeft} onClick={() => router.push("/")} title="Vissza a landing page-re">
          <Image
            src="/FinanceFlowLogo.png"
            width={130}
            height={130}
            alt="FinanceFlow"
            className={styles.Logo}
          />
        </div>
      </nav>

      {/* HAMBURGER FIX */}
      <div className={styles.FloatingBurger} onClick={() => setMenuOpen(!menuOpen)}>
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
        <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
      </div>

      {menuOpen && <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />}

      {/* SIDE MENU */}
      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        <span onClick={() => router.push("/profile")}>Profil</span>
        <span onClick={() => router.push("/statistics")}>Statisztikák</span>
        <span onClick={() => router.push("/settings")}>Beállítások</span>

        <span className={`${styles.ThemeToggle} ${isDarkMode ? styles.active : ""}`} onClick={toggleTheme}>
          {isDarkMode ? "☀️ Világos" : "🌙 Sötét"}
        </span>

        <span
          className={styles.Logout}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("isLoggedIn");
            router.push("/");
          }}
        >
          🚪 Kijelentkezés
        </span>
      </div>

      {/* CONTENT */}
      <div className={styles.HomeContent}>
        <button className={styles.AddExpenseBtn} onClick={() => setShowModal(true)}>
          + Új költés
        </button>

        {error && <div className={styles.ErrorMessage}>❌ {error}</div>}

        {loadingExpenses ? (
          <div className={styles.loadingSmall}>Betöltés...</div>
        ) : (
          <div className={styles.ExpenseList}>
            {expenses.length === 0 && <p>Nincs még rögzített költés.</p>}

            {expenses.map((e) => (
              <div key={e.id} className={styles.ExpenseItem}>
                <div>
                  <strong>{e.title}</strong>
                  <small>{e.category}</small>
                </div>

                <div className={styles.ExpenseRight}>
                  <span className={styles.ExpenseAmount}>-{e.amount.toLocaleString()} Ft</span>

                  <button className={styles.DeleteBtn} onClick={() => deleteExpense(e.id)} title="Törlés">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.ModalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.AddExpenseModal} onClick={(e) => e.stopPropagation()}>
            {/* CLOSE */}
            <button className={styles.CloseModalBtn} onClick={() => setShowModal(false)} aria-label="Bezárás">
              ✕
            </button>

            <h2>Új költés</h2>

            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mire költöttél?" />

            <input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="Összeg (Ft)" />

            <select className={styles.Select} value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Bills</option>
            </select>

            <button className={styles.SaveExpenseBtn} onClick={addExpense} disabled={saving}>
              {saving ? "Mentés..." : "Mentés"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
