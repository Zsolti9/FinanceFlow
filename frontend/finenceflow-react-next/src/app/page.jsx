"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./landing.module.css";

export default function LandingPage() {
  const router = useRouter();
  const navRef = useRef(null);
  const wrapperRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  /* NAVBAR PADDING */
  useEffect(function () {
    function updatePadding() {
      const navH = navRef.current ? navRef.current.offsetHeight : 0;
      if (wrapperRef.current) {
        wrapperRef.current.style.paddingTop = `${navH + 24}px`;
      }
    }

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return function () {
      window.removeEventListener("resize", updatePadding);
    };
  }, []);

  /* AUTH + THEME LOAD */
  useEffect(function () {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    const logged = localStorage.getItem("isLoggedIn") === "true";
    const darkMode = localStorage.getItem("darkMode") !== "false";

    setIsLoggedIn(!!token && logged);
    setIsDarkMode(darkMode);
  }, []);

  /* THEME TOGGLE */
  function toggleTheme() {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem("darkMode", newMode);
  }

  return (
    <div
      ref={wrapperRef}
      className={`${styles.LandingWrapper} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      {/* NAVBAR */}
      <nav ref={navRef} className={styles.Navbar}>
        <div
          className={styles.LogoContainer}
          onClick={function () {
            router.push("/");
          }}
        >
          <Image
            src="/FinanceFlowLogo.png"
            width={160}
            height={60}
            alt="FinanceFlow"
            className={styles.Logo}
          />
        </div>
      </nav>

      {/* ===== HAMBURGER – MINDIG LÁTSZIK ===== */}
      <div
        className={styles.FloatingBurger}
        onClick={function () {
          setMenuOpen(!menuOpen);
        }}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>

      {menuOpen && (
        <div
          className={styles.Overlay}
          onClick={function () {
            setMenuOpen(false);
          }}
        />
      )}

      {/* ===== SIDE MENU ===== */}
      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        {!isLoggedIn && (
          <>
            <span onClick={function () { router.push("/login"); }}>
              Bejelentkezés
            </span>
            <span onClick={function () { router.push("/register"); }}>
              Regisztráció
            </span>
          </>
        )}

        {isLoggedIn && (
          <>
            <span onClick={function () { router.push("/home"); }}>
              Profil
            </span>
            <span onClick={function () { router.push("/settings"); }}>
              Beállítások
            </span>
          </>
        )}

        <span
          className={`${styles.ThemeToggle} ${
            isDarkMode ? styles.active : ""
          }`}
          onClick={toggleTheme}
        >
          {isDarkMode ? "☀️ Világos mód" : "🌙 Sötét mód"}
        </span>

        {isLoggedIn && (
          <span
            className={styles.Logout}
            onClick={function () {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              localStorage.removeItem("isLoggedIn");
              router.push("/");
              window.location.reload();
            }}
          >
            🚪 Kijelentkezés
          </span>
        )}
      </div>

      {/* ===== TARTALOM ===== */}
      <section className={styles.SectionFeatures}>
        <h2>Miért a FinanceFlow?</h2>
        <div className={styles.FeatureGrid}>
          <div className={styles.CardGlass}>Kiadások követése</div>
          <div className={styles.CardGlass}>Bevétel kezelése</div>
          <div className={styles.CardGlass}>Automatikus grafikonok</div>
          <div className={styles.CardGlass}>Okos kategorizálás</div>
        </div>
      </section>

      <section className={styles.SectionCTA}>
        <h2>Készen állsz?</h2>
        <p>Csatlakozz és kezeld pénzügyeidet profin!</p>
        {!isLoggedIn && (
          <div
            className={styles.CTAButton}
            onClick={function () {
              router.push("/register");
            }}
          >
            Regisztrálok
          </div>
        )}
      </section>
    </div>
  );
}
