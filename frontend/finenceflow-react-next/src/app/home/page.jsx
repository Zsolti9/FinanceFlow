"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

  useEffect(() => setIsClient(true), []);

  const token = useMemo(() => {
    if (!isClient) return null;
    return localStorage.getItem("token");
  }, [isClient]);

  /* AUTH */
  useEffect(() => {
    if (!isClient) return;

    const storedUser = localStorage.getItem("user");
    const t = localStorage.getItem("token");

    if (!storedUser || !t) {
      router.replace("/login");
      return;
    }

    setUser(JSON.parse(storedUser));
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

  async function loadExpenses() {
    if (!token) return;

    setLoadingExpenses(true);
    setError("");

    try {
      const res = await fetch(DATA_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setExpenses(
        data.map((x) => ({
          id: x.id,
          title: x.name,
          amount: x.amount,
          category: x.category ?? "General",
        }))
      );
    } catch {
      setError("Szerver hiba.");
    } finally {
      setLoadingExpenses(false);
    }
  }

  useEffect(() => {
    if (!isClient || !user) return;
    loadExpenses();
  }, [isClient, user]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }

  if (!isClient || !user) {
    return <div className={styles.loading}>Betöltés...</div>;
  }

  const displayName =
    user?.username || user?.displayName || user?.email?.split("@")[0];

  return (
    <div
      className={`${styles.HomeBackground} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      <h1 className={styles.Greeting}>Szia, {displayName} 👋</h1>

      <nav
        className={`${styles.HomeNavbar} ${
          showNavbar ? styles.NavVisible : styles.NavHidden
        }`}
      >
        <div
          className={styles.HomeNavLeft}
          onClick={() => router.push("/")}
        >
          <Image
            src="/FinanceFlowLogo.png"
            width={130}
            height={130}
            alt="FinanceFlow"
            className={styles.Logo}
          />
        </div>
      </nav>

      <div
        className={styles.FloatingBurger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>

      {menuOpen && (
        <div
          className={styles.Overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        <span onClick={() => router.push("/profile")}>👤Profil</span>
        <span onClick={() => router.push("/statistics")}>📝Statisztikák</span>
        <span onClick={() => router.push("/settings")}>⚙️Beállítások</span>
        <span className={styles.Logout} onClick={logout}>
          🚪 Kijelentkezés
        </span>
      </div>

      {/* CONTENT marad változatlan */}
    </div>
  );
}
