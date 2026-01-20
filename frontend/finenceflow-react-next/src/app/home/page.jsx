"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);

  /* CLIENT */
  useEffect(function () {
    setIsClient(true);
  }, []);

  /* AUTH */
  useEffect(function () {
    if (!isClient) return;

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.clear();
      router.push("/login");
    }
  }, [isClient, router]);

  /* NAVBAR SCROLL */
  useEffect(function () {
    function handleScroll() {
      setShowNavbar(window.scrollY === 0);
    }
    window.addEventListener("scroll", handleScroll);
    return function () {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* LOAD EXPENSES */
  useEffect(function () {
    if (!isClient) return;
    const stored = localStorage.getItem("expenses");
    if (stored) {
      setExpenses(JSON.parse(stored));
    }
  }, [isClient]);

  /* SAVE EXPENSES */
  useEffect(function () {
    if (!isClient) return;
    localStorage.setItem("expenses", JSON.stringify(expenses));
  }, [expenses, isClient]);

  function addExpense() {
    const title = document.getElementById("title").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;

    if (!title || !amount) return;

    setExpenses([
      {
        id: Date.now(),
        title: title,
        amount: Number(amount),
        category: category,
        date: new Date().toISOString()
      },
      ...expenses
    ]);

    setShowModal(false);
  }

  if (!isClient || !user) {
    return (
      <div className={styles.loading}>
        <div>Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={styles.HomeBackground}>
      <h1 className={styles.Greeting}>
  Szia, {user?.username || user?.DisplayName || user?.name || user?.email?.split("@")[0]} 👋
</h1>

      {/* NAVBAR */}
      <nav className={`${styles.HomeNavbar} ${showNavbar ? styles.NavVisible : styles.NavHidden}`}>
        <div
  className={styles.HomeNavLeft}
  onClick={() => router.push("/")}
  title="Vissza a főoldalra"
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

      {/* HAMBURGER */}
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
        <span
          className={styles.Logout}
          onClick={() => {
            localStorage.clear();
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

        <div className={styles.ExpenseList}>
          {expenses.map(function (e) {
            return (
              <div key={e.id} className={styles.ExpenseItem}>
                <div>
                  <strong>{e.title}</strong>
                  <small>{e.category}</small>
                </div>
                <span className={styles.ExpenseAmount}>
                  -{e.amount.toLocaleString()} Ft
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className={styles.ModalOverlay}>
          <div className={styles.AddExpenseModal}>
            <h2>Új költés</h2>
            <input id="title" placeholder="Mire költöttél?" />
            <input id="amount" type="number" placeholder="Összeg (Ft)" />
            <select id="category">
              <option>Food</option>
              <option>Transport</option>
              <option>Shopping</option>
              <option>Bills</option>
            </select>

            <button className={styles.SaveExpenseBtn} onClick={addExpense}>
              Mentés
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
