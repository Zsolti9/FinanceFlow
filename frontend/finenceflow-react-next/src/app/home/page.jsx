"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <div className={styles.HomeBackground}>
      
      {/* NAVBAR */}
      <nav className={styles.HomeNavbar}>
        <div className={styles.HomeNavLeft} onClick={() => router.push("/")}>
          <Image
            src="/FinanceFlowLogo.png"
            width={80}
            height={80}
            alt="Logo"
            className={styles.HomeNavLogo}
          />
        </div>

        {/* HAMBURGER */}
        <div 
          className={styles.Burger} 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.open : ""}`} />
        </div>
      </nav>

      {/* OVERLAY háttér (blur menü nyitva) */}
      {menuOpen && <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />}

      {/* SLIDE-IN BLUR MENÜ */}
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

      {/* OLDAL TARTALOM */}
      <div className={styles.HomeContent}>
        <h1>Üdv újra!</h1>
        <p>Itt kezdődnek a pénzügyi elemzéseid.</p>
      </div>
    </div>
  );
}
