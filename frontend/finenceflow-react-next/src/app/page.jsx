"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./landing.module.css";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className={styles.LandingDiv}>

      <nav className={styles.Navbar}>
        <div className={styles.LogoContainer} onClick={() => router.push("/")}>
          <Image src="/FinanceFlowLogo.png" alt="Logo" width={80} height={80} />
        </div>

        <div className={styles.NavLinks}>
          <span onClick={() => router.push("/login")}>Bejelentkezés</span>
          <span onClick={() => router.push("/register")}>Regisztráció</span>
        </div>
      </nav>

      <div className={styles.Hero}>
        <h1>Pénzügyek egyszerűen és átláthatóan.</h1>
        <p>Kezeld a kiadásaidat és bevételeidet modern, letisztult felületen.</p>
      </div>
    </div>
  );
}
