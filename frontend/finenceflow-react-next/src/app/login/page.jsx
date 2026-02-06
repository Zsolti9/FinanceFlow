"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppLogo from "../components/AppLogo";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://localhost:7183/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem(
          "user", 
          JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            username: data.user.username
          })
        );
        alert("Sikeres bejelentkezés!");
        router.push("/home");
      } else {
        alert("Hibás adatok!");
      }
    } catch (error) {
      console.error("Hiba a bejelentkezéskor:", error);
      alert("Hiba történt a bejelentkezés során.");
    }
  };

  return (
    <div className={styles.LoginWrapper}>
      {/* BAL FELSŐ FIX LOGO */}
      <div className={styles.TopLogo} onClick={() => router.push("/")}>
        <AppLogo fixed size="sm" href="/" />
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
