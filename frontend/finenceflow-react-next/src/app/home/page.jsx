"use client";

import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

export default function HomePage() {

  const [user, setUser] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("token");

  if (!storedUser || !token) {
    router.push("/login");
    return;
  }

  setUser(JSON.parse(storedUser));
}, []);

  const [showNavbar, setShowNavbar] = useState(true);


  useEffect(() => {
  const handleScroll = () => {
    // csak akkor látszik, ha fent vagyunk
    setShowNavbar(window.scrollY === 0);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);



  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // --- Kalkulátor states ---
  const [salary, setSalary] = useState("");

  // AUTÓ
  const [hasCar, setHasCar] = useState(false);
  const [kmPerDay, setKmPerDay] = useState("");
  const [consumption, setConsumption] = useState(6.5);
  const [fuelPrice, setFuelPrice] = useState(620);

  // LAKÁS
  const [hasHome, setHasHome] = useState(false);
  const [homeCost, setHomeCost] = useState("");

  // REZSI
  const [utilities, setUtilities] = useState("");

  // Kaja + Szórakozás
  const [foodCost, setFoodCost] = useState("");
  const [funCost, setFunCost] = useState("");

  const [result, setResult] = useState(null);

  const calculate = () => {
    let monthlyFuelCost = 0;
    let monthlyHomeCost = hasHome ? Number(homeCost) : 0;
    let monthlyUtilitiesCost = Number(utilities) || 0;
    let monthlyFoodCost = Number(foodCost) || 0;
    let monthlyFunCost = Number(funCost) || 0;

    if (hasCar) {
      const dailyFuel = (kmPerDay / 100) * consumption;
      const monthlyFuel = dailyFuel * 30;
      monthlyFuelCost = Math.round(monthlyFuel * fuelPrice);
    }

    const totalExpenses =
      monthlyFuelCost +
      monthlyHomeCost +
      monthlyUtilitiesCost +
      monthlyFoodCost +
      monthlyFunCost;

    const remaining = salary - totalExpenses;

    setResult({
      monthlyFuelCost,
      monthlyHomeCost,
      monthlyUtilitiesCost,
      monthlyFoodCost,
      monthlyFunCost,
      totalExpenses,
      remaining,
    });
  };

  return (
    <div className={styles.HomeBackground}>
      <h1>Szia, {user?.displayName} 👋</h1>
      {/* NAVBAR */}
      <nav
  className={`${styles.HomeNavbar} ${
    showNavbar ? styles.NavVisible : styles.NavHidden
  }`}
>
        <div className={styles.HomeNavLeft} onClick={() => router.push("/")}>
          <Image
            src="/FinanceFlowLogo.png"
            width={80}
            height={80}
            alt="Logo"
            className={styles.HomeNavLogo}
          />
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


      {/* OVERLAY háttér */}
      {menuOpen && <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />}

      {/* SLIDE-IN MENU */}
      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        <span onClick={() => router.push("/profile")}>Profil</span>
        <span onClick={() => router.push("/statistics")}>Statisztikák</span>
        <span onClick={() => router.push("/settings")}>Beállítások</span>
        <span 
          className={styles.Logout}
          onClick={() => {
            localStorage.removeItem("token");
            router.push("/");
          }}
        >
          Kijelentkezés
        </span>
      </div>

      {/* TARTALOM */}
      <div className={styles.HomeContent}>
        <h1>Havi költség kalkulátor</h1>
        <p>Pontosan mutatjuk, mennyi marad hó végére.</p>

        {/* KALKULÁTOR */}
        <div className={styles.CalcCard}>

          <h2>Alap adatok</h2>

          <label>💰 Havi fizetésed (Ft)</label>
          <input
            type="number"
            value={salary}
            onChange={(e) => setSalary(Number(e.target.value))}
            placeholder="pl. 350000"
          />

          {/* AUTÓ */}
          <h2>Autó</h2>

          <label>🚗 Van autód?</label>
          <div className={styles.SwitchRow}>
            <button
              className={!hasCar ? styles.ActiveBtn : ""}
              onClick={() => setHasCar(false)}
            >
              Nincs
            </button>
            <button
              className={hasCar ? styles.ActiveBtn : ""}
              onClick={() => setHasCar(true)}
            >
              Van
            </button>
          </div>

          {hasCar && (
            <div className={styles.CarInputs}>
              <label>📍 Naponta megtett táv (km)</label>
              <input
                type="number"
                value={kmPerDay}
                onChange={(e) => setKmPerDay(Number(e.target.value))}
                placeholder="pl. 25"
              />

              <label>⛽ Fogyasztás (L / 100km)</label>
              <input
                type="number"
                value={consumption}
                step="0.1"
                onChange={(e) => setConsumption(Number(e.target.value))}
              />

              <label>💵 Benzin ára (Ft)</label>
              <input
                type="number"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(Number(e.target.value))}
              />
            </div>
          )}

          {/* LAKÁS */}
          <h2>Lakhatás</h2>

          <label>🏠 Van lakás/lalbér/hiteled?</label>
          <div className={styles.SwitchRow}>
            <button
              className={!hasHome ? styles.ActiveBtn : ""}
              onClick={() => setHasHome(false)}
            >
              Nincs
            </button>
            <button
              className={hasHome ? styles.ActiveBtn : ""}
              onClick={() => setHasHome(true)}
            >
              Van
            </button>
          </div>

          {hasHome && (
            <>
              <label>🏡 Lakhatás havi költsége (Ft)</label>
              <input
                type="number"
                value={homeCost}
                onChange={(e) => setHomeCost(Number(e.target.value))}
                placeholder="pl. 140000"
              />
            </>
          )}

          {/* REZSI */}
          <h2>Rezsi</h2>

          <label>💡 Rezsi teljes összege (Ft / hó)</label>
          <input
            type="number"
            value={utilities}
            onChange={(e) => setUtilities(Number(e.target.value))}
            placeholder="pl. 45000"
          />

          {/* KAJA */}
          <h2>Kaja</h2>

          <label>🍽️ Kaja költség (Ft / hó)</label>
          <input
            type="number"
            value={foodCost}
            onChange={(e) => setFoodCost(Number(e.target.value))}
            placeholder="pl. 60000"
          />

          {/* SZÓRAKOZÁS */}
          <h2>Szórakozás</h2>

          <label>🎉 Szórakozás / hobbik (Ft / hó)</label>
          <input
            type="number"
            value={funCost}
            onChange={(e) => setFunCost(Number(e.target.value))}
            placeholder="pl. 20000"
          />

          <button className={styles.CalcBtn} onClick={calculate}>
            Számolás
          </button>

          {result && (
            <div className={styles.ResultBox}>
              <h3>📊 Eredmények</h3>

              {hasCar && (
                <p>⛽ Üzemanyag: <b>{result.monthlyFuelCost.toLocaleString()} Ft</b></p>
              )}

              {hasHome && (
                <p>🏡 Lakhatás: <b>{result.monthlyHomeCost.toLocaleString()} Ft</b></p>
              )}

              <p>💡 Rezsi: <b>{result.monthlyUtilitiesCost.toLocaleString()} Ft</b></p>
              <p>🍽️ Kaja: <b>{result.monthlyFoodCost.toLocaleString()} Ft</b></p>
              <p>🎉 Szórakozás: <b>{result.monthlyFunCost.toLocaleString()} Ft</b></p>

              <hr />

              <p>📉 Összes havi költés: <b>{result.totalExpenses.toLocaleString()} Ft</b></p>
              <p
                className={
                result.remaining < 0
                ? styles.Negative
                : styles.Positive
                }
              >
                💰 Megmaradt pénz: <b>{result.remaining.toLocaleString()} Ft</b>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
