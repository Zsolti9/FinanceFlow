"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "./landing.module.css";
import AppLogo from "./components/AppLogo";


export default function LandingPage() {
  const router = useRouter();
  const pathname = usePathname();

  const navRef = useRef(null);
  const wrapperRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  /* NAVBAR PADDING */
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

  /* AUTH + THEME */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const darkMode = localStorage.getItem("darkMode") !== "false";
    setIsLoggedIn(!!token);
    setIsDarkMode(darkMode);
  }, [pathname]);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setMenuOpen(false);
    router.push("/");
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
          onClick={() => router.push("/")}
        >
          <AppLogo size="lg" href="/" />
        </div>
      </nav>

      {/* HAMBURGER */}
      <div
        className={styles.FloatingBurger}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </div>

      {menuOpen && (
        <div className={styles.Overlay} onClick={() => setMenuOpen(false)} />
      )}

      {/* SIDE MENU */}
      <div className={`${styles.BlurMenu} ${menuOpen ? styles.show : ""}`}>
        {!isLoggedIn && (
          <>
            <span onClick={() => router.push("/login")}>🔑 Bejelentkezés</span>
            <span onClick={() => router.push("/register")}>📝 Regisztráció</span>
          </>
        )}

        {isLoggedIn && (
          <>
            <span onClick={() => router.push("/home")}>🏠 Home</span>
            <span onClick={() => router.push("/profile")}>👤 Profil</span>
            <span onClick={() => router.push("/settings")}>⚙️ Beállítások</span>
            <span className={styles.Logout} onClick={logout}>
              🚪 Kijelentkezés
            </span>
          </>
        )}
      </div>

      {/* ===== HERO ===== */}
      <section className={styles.Hero}>
        <div className={styles.HeroLeft}>
          <h1>
            Kezeld a pénzügyeid <br />
            <span>egyszerűen.</span>
          </h1>

          <p>
            A FinanceFlow segít átlátni a kiadásaid, tervezni a jövőt
            és kézben tartani a pénzed.
          </p>

          <div className={styles.HeroActions}>
            {!isLoggedIn && (
              <button
                className={styles.PrimaryBtn}
                onClick={() => router.push("/register")}
              >
                Ingyen kipróbálom
              </button>
            )}

            <button
              className={styles.SecondaryBtn}
              onClick={() =>
                isLoggedIn ? router.push("/home") : router.push("/login")
              }
            >
              {isLoggedIn ? "Ugrás a Home-ra" : "Bejelentkezés"}
            </button>
          </div>
        </div>

        <div className={styles.HeroRight}>
          <div className={styles.MockupGlow} />

          <img
            src="/home page 1.png"
            alt="FinanceFlow dashboard"
            className={styles.Mockup}
          />

          {/* FEATURE DOTS */}
          <div
            className={styles.FeatureDot}
            style={{ top: "22%", left: "25%" }}
          >
            <span>📊 Valós idejű statisztikák</span>
          </div>

          <div
            className={styles.FeatureDot}
            style={{ top: "60%", left: "25%" }}
          >
            <span>💸 Kategorizált kiadások</span>
          </div>

          <div
            className={styles.FeatureDot}
            style={{ top: "14%", left: "80%" }}
          >
            <span>📈 Havi trendek</span>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className={styles.TrustStrip}>
        <div>🔒 Biztonságos adatkezelés</div>
        <div>📊 Valós idejű költéskövetés</div>
        <div>⚡ Gyors és letisztult</div>
        <div>📱 Mobilbarát</div>
      </section>

      {/* ===== FEATURE SHOWCASE ===== */}
      <section className={styles.FeatureShowcase}>
        <div className={styles.FeatureItem}>
          <div>
            <h3>📊 Lásd, mire megy el a pénzed</h3>
            <p>Áttekinthető listák és statisztikák egy helyen.</p>
          </div>
          <div className={styles.FeatureMockupWrap}>
            <img src="/home page 2.png" alt="Kiadások" className={styles.Mockup}/>

            <div
              className={`${styles.FeatureDot} ${styles.ShowcaseDot}`}
              style={{ top: "28%", left: "18%" }}
            >
              <span>🏷️ Azonnali kategória címkék</span>
            </div>

            <div
              className={`${styles.FeatureDot} ${styles.ShowcaseDot}`}
              style={{ top: "72%", left: "72%" }}
            >
              <span>✅ Gyors költés-ellenőrzés</span>
            </div>
          </div>
        </div>

        <div className={`${styles.FeatureItem} ${styles.reverse}`}>
          <div>
            <h3>📈 Tervezz előre okosan</h3>
            <p>Kategóriák és trendek segítik a döntéseid.</p>
          </div>
          <div className={styles.FeatureMockupWrap}>
            <img src="/Statisztikak 1.png" alt="Statisztikák" className={styles.Mockup}/>

            <div
              className={`${styles.FeatureDot} ${styles.ShowcaseDot}`}
              style={{ top: "20%", left: "74%" }}
            >
              <span>📉 Trend elemzés egy nézetben</span>
            </div>

            <div
              className={`${styles.FeatureDot} ${styles.ShowcaseDot}`}
              style={{ top: "66%", left: "20%" }}
            >
              <span>🎯 Célok követése hónapról hónapra</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className={styles.HowItWorks}>
        <h2>Így működik</h2>

        <div className={styles.Steps}>
          <div className={styles.StepCard}>
            <span>1</span>
            <h4>Regisztrálsz</h4>
            <p>Gyors és ingyenes.</p>
          </div>
          <div className={styles.StepCard}>
            <span>2</span>
            <h4>Rögzíted a költéseid</h4>
            <p>Pár kattintás.</p>
          </div>
          <div className={styles.StepCard}>
            <span>3</span>
            <h4>Átlátod a pénzügyeid</h4>
            <p>Grafikonok és összesítések.</p>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      {!isLoggedIn && (
        <section className={styles.SectionCTA}>
          <h2>Készen állsz?</h2>
          <p>Csatlakozz és kezeld pénzügyeidet profin!</p>
          <div
            className={styles.CTAButton}
            onClick={() => router.push("/register")}
          >
            Regisztrálok
          </div>
        </section>
      )}
    </div>
  );
}
