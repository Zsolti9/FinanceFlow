"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";  // ✅ useState MEGVAN
import styles from "./landing.module.css";
import logo from "../../public/FinanceFlowLogo.png";

export default function LandingPage() {
  const router = useRouter();
  const navRef = useRef(null);
  const wrapperRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // ✅ useState DEFINIÁLVA

  useEffect(() => {
    function updatePadding() {
      const navH = navRef.current ? navRef.current.offsetHeight : 0;
      if (wrapperRef.current) {
        wrapperRef.current.style.paddingTop = `${navH + 24}px`;
      }
    }

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);

  // ✅ EZ A USEFFECT - CSAK EZ KELL!
  useEffect(() => {
    if (typeof window === 'undefined') return; // SSR védelem
    
    const hasToken = localStorage.getItem("token");
    const isLoggedInStatus = localStorage.getItem("isLoggedIn") === "true";
    
    // 🆗 HELYI VÁLTOZÓ, NEM KÖZVETLEN SET
    const loggedInStatus = hasToken && isLoggedInStatus;
    setIsLoggedIn(loggedInStatus);
  }, []);

  return (
    <div ref={wrapperRef} className={styles.LandingWrapper}>
      <nav ref={navRef} className={styles.Navbar}>
        <div className={styles.LogoContainer} onClick={() => router.push("/")}>
          <Image src={logo} alt="Logo" width={160} height={60} />
        </div>
        
        {/* GOMBOK CSAK HA NEM bejelentkezett */}
        {!isLoggedIn && (
          <div className={styles.NavLinks}>
            <span onClick={() => router.push("/login")}>Bejelentkezés</span>
            <span onClick={() => router.push("/register")}>Regisztráció</span>
          </div>
        )}
        
        {isLoggedIn && (
          <div className={styles.NavLoggedIn}>
            Bejelentkeztél ✅
          </div>
        )}
      </nav>

      <section className={styles.SectionFeatures}>
        <h2>Miért a FinanceFlow?</h2>
        <div className={styles.FeatureGrid}>
          <div className={styles.CardGlass}>Kiadások követése</div>
          <div className={styles.CardGlass}>Bevétel kezelése</div>
          <div className={styles.CardGlass}>Automatikus grafikonok</div>
          <div className={styles.CardGlass}>Okos kategorizálás</div>
        </div>
      </section>

      <section className={styles.SectionScreenshots}>
        <h2>Pillanatképek</h2>
        <div className={styles.ScreenshotArea}>
          <div className={styles.CardGlass} style={{ display: "inline-block" }}>
            Itt majd képek lesznek
          </div>
        </div>
      </section>

      <section className={styles.SectionCTA}>
        <h2>Készen állsz?</h2>
        <p>Csatlakozz és kezeld pénzügyeidet profin!</p>
        {!isLoggedIn && (
          <div className={styles.CTAButton} onClick={() => router.push("/register")}>
            Regisztrálok
          </div>
        )}
      </section>
    </div>
  );
}
