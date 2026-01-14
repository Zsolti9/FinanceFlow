"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showNavbar, setShowNavbar] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [saving, setSaving] = useState(false);

  // Kalkulátor state-ek
  const [salary, setSalary] = useState("");
  const [hasCar, setHasCar] = useState(false);
  const [kmPerDay, setKmPerDay] = useState("");
  const [consumption, setConsumption] = useState(6.5);
  const [fuelPrice, setFuelPrice] = useState(620);
  const [hasHome, setHasHome] = useState(false);
  const [homeCost, setHomeCost] = useState("");
  const [utilities, setUtilities] = useState("");
  const [foodCost, setFoodCost] = useState("");
  const [funCost, setFunCost] = useState("");
  const [result, setResult] = useState(null);

  // Client ellenőrzés
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auth check
  useEffect(() => {
    if (!isClient) return;

    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!storedUser || !token) {
      router.push("/login");
      return;
    }

    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      localStorage.clear();
      router.push("/login");
    }
  }, [isClient, router]);

  // Kalkulátor adatok betöltése localStorage-ból
  useEffect(() => {
    if (!isClient) return;

    setSalary(localStorage.getItem("calc_salary") || "");
    setHasCar(localStorage.getItem("calc_hasCar") === "true");
    setKmPerDay(localStorage.getItem("calc_kmPerDay") || "");
    setConsumption(Number(localStorage.getItem("calc_consumption")) || 6.5);
    setFuelPrice(Number(localStorage.getItem("calc_fuelPrice")) || 620);
    setHasHome(localStorage.getItem("calc_hasHome") === "true");
    setHomeCost(localStorage.getItem("calc_homeCost") || "");
    setUtilities(localStorage.getItem("calc_utilities") || "");
    setFoodCost(localStorage.getItem("calc_foodCost") || "");
    setFunCost(localStorage.getItem("calc_funCost") || "");
  }, [isClient]);

  // Navbar scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mentés localStorage-ba
  const saveToStorage = (key, value) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, value);
    }
  };

  // Automatikus localStorage mentések
  useEffect(() => { if (isClient) saveToStorage("calc_salary", salary); }, [salary, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_hasCar", hasCar.toString()); }, [hasCar, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_kmPerDay", kmPerDay); }, [kmPerDay, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_consumption", consumption.toString()); }, [consumption, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_fuelPrice", fuelPrice.toString()); }, [fuelPrice, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_hasHome", hasHome.toString()); }, [hasHome, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_homeCost", homeCost); }, [homeCost, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_utilities", utilities); }, [utilities, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_foodCost", foodCost); }, [foodCost, isClient]);
  useEffect(() => { if (isClient) saveToStorage("calc_funCost", funCost); }, [funCost, isClient]);

  // Számítás
  const calculate = () => {
    let monthlyFuelCost = 0;
    let monthlyHomeCost = hasHome ? Number(homeCost) || 0 : 0;
    let monthlyUtilitiesCost = Number(utilities) || 0;
    let monthlyFoodCost = Number(foodCost) || 0;
    let monthlyFunCost = Number(funCost) || 0;

    if (hasCar && kmPerDay) {
      const dailyFuel = (Number(kmPerDay) / 100) * Number(consumption);
      const monthlyFuel = dailyFuel * 30;
      monthlyFuelCost = Math.round(monthlyFuel * Number(fuelPrice));
    }

    const totalExpenses = monthlyFuelCost + monthlyHomeCost + monthlyUtilitiesCost + monthlyFoodCost + monthlyFunCost;
    const remaining = Number(salary) || 0 - totalExpenses;

    setResult({ monthlyFuelCost, monthlyHomeCost, monthlyUtilitiesCost, monthlyFoodCost, monthlyFunCost, totalExpenses, remaining });
  };

  // ✅ DATA CONTROLLER MENTÉS!
  const saveToDatabase = async () => {
  if (!result) return;

  setSaving(true);
  try {
    const token = localStorage.getItem("token");
    
    const response = await fetch("https://localhost:7183/api/Data/addUserData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        userId: user.id,
        fizetes: Number(salary),
        auto: hasCar,
        benzinKolt: result.monthlyFuelCost,
        lakasKolt: result.monthlyHomeCost,
        lakhatas: hasHome,
        szamlak: Number(utilities),
        egyeb: result.monthlyFoodCost + result.monthlyFunCost
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      if (result.message.includes("frissítve")) {
        alert("✅ Adatok frissítve!");
      } else {
        alert("✅ Új költségvetés létrehozva!");
      }
    } else {
      alert(`❌ Hiba: ${result}`);
    }
  } catch (error) {
    console.error("Mentés hiba:", error);
    alert("❌ Hálózati hiba!");
  } finally {
    setSaving(false);
  }
};

  // Loading
  if (!isClient || !user) {
    return (
      <div className={styles.loading}>
        <div>Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={styles.HomeBackground}>
      <h1>Szia, {user?.DisplayName?.split(" ")[0] || user?.email?.split("@")[0] || "Felhasználó"} 👋</h1>
      
      {/* NAVBAR */}
      <nav className={`${styles.HomeNavbar} ${showNavbar ? styles.NavVisible : styles.NavHidden}`}>
        <div className={styles.HomeNavLeft} onClick={() => router.push("/")}>
          <Image src="/FinanceFlowLogo.png" width={80} height={80} alt="Logo" className={styles.HomeNavLogo} />
        </div>
      </nav>

      {/* HAMBURGER */}
<div className={styles.FloatingBurger} onClick={() => setMenuOpen(!menuOpen)}>
  <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
  <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
  <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
</div>

{/* OVERLAY */}
{menuOpen && <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />}

/* SLIDE-IN MENU */
<div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
  <span onClick={() => { 
    setMenuOpen(false); 
    router.push("/profile"); 
  }}>
    Profil
  </span>
  <span onClick={() => { 
    setMenuOpen(false); 
    router.push("/statistics"); 
  }}>
    Statisztikák
  </span>
  <span onClick={() => { 
    setMenuOpen(false); 
    router.push("/settings"); 
  }}>
  Beállítások
  </span>
  <span 
    className={styles.Logout}
    onClick={() => {
      setMenuOpen(false);        // ✅ Menü bezárása
      localStorage.removeItem("token");    // ✅ Token törlése
      localStorage.removeItem("user");     // ✅ User törlése
      router.push("/");          // ✅ FŐOLDAL ("/")
    }}
  >
    🚪 Kijelentkezés
  </span>
</div>

      {/* TARTALOM */}
      <div className={styles.HomeContent}>
        <h1>Havi költség kalkulátor</h1>
        <p>Pontosan mutatjuk, mennyi marad hó végére.</p>

        <div className={styles.CalcCard}>
          {/* Alap adatok */}
          <h2>Alap adatok</h2>
          <label>💰 Havi fizetésed (Ft)</label>
          <input 
            type="number" 
            value={salary} 
            onChange={(e) => setSalary(e.target.value)} 
            placeholder="pl. 350000" 
          />

          {/* Autó */}
          <h2>Autó</h2>
          <label>🚗 Van autód?</label>
          <div className={styles.SwitchRow}>
            <button className={!hasCar ? styles.ActiveBtn : ""} onClick={() => setHasCar(false)}>Nincs</button>
            <button className={hasCar ? styles.ActiveBtn : ""} onClick={() => setHasCar(true)}>Van</button>
          </div>

          {hasCar && (
            <div className={styles.CarInputs}>
              <label>📍 Naponta megtett táv (km)</label>
              <input type="number" value={kmPerDay} onChange={(e) => setKmPerDay(e.target.value)} placeholder="pl. 25" />
              <label>⛽ Fogyasztás (L / 100km)</label>
              <input type="number" value={consumption} step="0.1" onChange={(e) => setConsumption(e.target.value)} />
              <label>💵 Benzin ára (Ft)</label>
              <input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(e.target.value)} />
            </div>
          )}

          {/* Lakhatás */}
          <h2>Lakhatás</h2>
          <label>🏠 Van lakás/lakbér/hiteled?</label>
          <div className={styles.SwitchRow}>
            <button className={!hasHome ? styles.ActiveBtn : ""} onClick={() => setHasHome(false)}>Nincs</button>
            <button className={hasHome ? styles.ActiveBtn : ""} onClick={() => setHasHome(true)}>Van</button>
          </div>

          {hasHome && (
            <>
              <label>🏡 Lakhatás havi költsége (Ft)</label>
              <input type="number" value={homeCost} onChange={(e) => setHomeCost(e.target.value)} placeholder="pl. 140000" />
            </>
          )}

          {/* Rezsi */}
          <h2>Rezsi</h2>
          <label>💡 Rezsi teljes összege (Ft / hó)</label>
          <input type="number" value={utilities} onChange={(e) => setUtilities(e.target.value)} placeholder="pl. 45000" />

          {/* Kaja */}
          <h2>Kaja</h2>
          <label>🍽️ Kaja költség (Ft / hó)</label>
          <input type="number" value={foodCost} onChange={(e) => setFoodCost(e.target.value)} placeholder="pl. 60000" />

          {/* Szórakozás */}
          <h2>Szórakozás</h2>
          <label>🎉 Szórakozás / hobbik (Ft / hó)</label>
          <input type="number" value={funCost} onChange={(e) => setFunCost(e.target.value)} placeholder="pl. 20000" />

          <button className={styles.CalcBtn} onClick={calculate}>
            Számolás
          </button>

          {/* EREDMÉNYEK */}
          {result && (
            <div className={styles.ResultBox}>
              <h3>📊 Eredmények</h3>
              {hasCar && <p>⛽ Üzemanyag: <b>{result.monthlyFuelCost.toLocaleString()} Ft</b></p>}
              {hasHome && <p>🏡 Lakhatás: <b>{result.monthlyHomeCost.toLocaleString()} Ft</b></p>}
              <p>💡 Rezsi: <b>{result.monthlyUtilitiesCost.toLocaleString()} Ft</b></p>
              <p>🍽️ Kaja: <b>{result.monthlyFoodCost.toLocaleString()} Ft</b></p>
              <p>🎉 Szórakozás: <b>{result.monthlyFunCost.toLocaleString()} Ft</b></p>
              <hr />
              <p>📉 Összes havi költés: <b>{result.totalExpenses.toLocaleString()} Ft</b></p>
              <p className={result.remaining < 0 ? styles.Negative : styles.Positive}>
                💰 Megmaradt pénz: <b>{result.remaining.toLocaleString()} Ft</b>
              </p>
              
              <div className={styles.ButtonRow}>
  <button 
    className={styles.SaveBtn}
    onClick={saveToDatabase}
    disabled={saving}
  >
    {saving ? "💾 Mentés..." : "💾 MENTÉS/FRISSÍTÉS"}
  </button>
  <button className={styles.ClearBtn} onClick={clearCalculator}>
    🗑️ Újraindítás
  </button>
</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
