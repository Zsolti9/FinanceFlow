"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email:email ,
        password: password,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);

      alert("Sikeres bejelentkezés!");
      router.push("/home");
    } else {
      alert("Hibás adatok!");
    }
  };

  return (
    <div className={styles.LoginWrapper}>
      
      {/* BAL FELSŐ FIX LOGO */}
      <div className={styles.TopLogo} onClick={() => router.push("/")}>
        <Image
          src="/FinanceFlowLogo.png"
          width={100}
          height={100}
          alt="FinanceFlow Logo"
        />
      </div>

      <div className={styles.LoginBox}>
        <h2 className={styles.LoginTitle}>Bejelentkezés</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className={styles.LoginInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Jelszó"
            className={styles.LoginInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.LoginBtn}>
            Bejelentkezés
          </button>
        </form>

        <span
          className={styles.LoginSwitchLink}
          onClick={() => router.push("/register")}
        >
          Nincs még fiókod? Regisztrálj!
        </span>
      </div>
    </div>
  );
}
