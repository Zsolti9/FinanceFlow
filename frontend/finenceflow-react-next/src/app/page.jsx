"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import styles from "./landing.module.css";
import logo from "../../public/FinanceFlowLogo.png";

export default function LandingPage() {
  const router = useRouter();
  const navRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function updatePadding() {
      const navH = navRef.current ? navRef.current.offsetHeight : 0;
      if (wrapperRef.current) {
        // + 24px extra hely, állítsd ízlés szerint
        wrapperRef.current.style.paddingTop = `${navH + 24}px`;
      }
    }

    updatePadding();
    window.addEventListener("resize", updatePadding);
    return () => window.removeEventListener("resize", updatePadding);
  }, []);
  return (
    <div ref={wrapperRef} className={styles.LandingWrapper}>
      <nav ref={navRef} className={styles.Navbar}>
        <div className={styles.LogoContainer} onClick={() => router.push("/")}>
          <Image src={logo} alt="Logo" width={160} height={60} />
        </div>
        <div className={styles.NavLinks}>
          <span onClick={() => router.push("/login")}>Bejelentkezés</span>
          <span onClick={() => router.push("/register")}>Regisztráció</span>
        </div>
      </nav>

      {/* A tartalom jön ide: például a title */}
      <section className={styles.SectionFeatures}>
        <h2>Miért a FinanceFlow?</h2>


        <div className={styles.FeatureGrid}>
          <div className={styles.CardGlass}>Kiadások követése</div>
          <div className={styles.CardGlass}>Bevétel kezelése</div>
          <div className={styles.CardGlass}>Automatikus grafikonok</div>
          <div className={styles.CardGlass}>Okos kategorizálás</div>
        </div>
      </section>

      {/* 2. SECTION - SCREENSHOTS */}
      <section className={styles.SectionScreenshots}>
        <h2>Pillanatképek</h2>

        <div className={styles.ScreenshotArea}>
          <div className={styles.CardGlass} style={{ display: "inline-block" }}>
            Itt majd képek lesznek
          </div>
        </div>
      </section>

      {/* 3. SECTION – PRICING */}
      <section className={styles.SectionPricing}>
        <h2>Árazás</h2>

        <div className={styles.PriceGrid}>
          <div className={styles.PriceCard}>Free</div>
          <div className={styles.PriceCard}>Pro</div>
          <div className={styles.PriceCard}>Ultimate</div>
        </div>
      </section>

      {/* 4. SECTION – CTA */}
      <section className={styles.SectionCTA}>
        <h2>Készen állsz?</h2>
        <p>Csatlakozz és kezeld pénzügyeidet profin!</p>

        <div className={styles.CTAButton} onClick={() => router.push("/register")}>
          Regisztrálok
        </div>
      </section>

    </div>
  );
}
