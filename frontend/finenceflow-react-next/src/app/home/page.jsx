"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./home.module.css";

export default function HomePage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className={styles.HomeBackground}>

      <nav className={styles.HomeNavbar}>
        <div className={styles.HomeNavLeft} onClick={() => router.push("/")}>
          <Image src="/FinanceFlowLogo.png" alt="Logo" width={80} height={80} />
        </div>

        <div className={styles.Burger} onClick={() => setOpen(!open)}>
          <div className={`${styles.bar} ${open ? styles.open : ""}`}></div>
          <div className={`${styles.bar} ${open ? styles.open : ""}`}></div>
          <div className={`${styles.bar} ${open ? styles.open : ""}`}></div>
        </div>
      </nav>

      <div className={`${styles.HomeMenu} ${open ? styles.show : ""}`}>
        <span>Menüpont 1</span>
        <span>Menüpont 2</span>
        <span onClick={logout}>Kijelentkezés</span>
      </div>

      <div className={styles.HomeContent}>
        <h1>Üdv újra!</h1>
        <p>Itt fog megjelenni a pénzügyi áttekintésed.</p>
      </div>

    </div>
  );
}
