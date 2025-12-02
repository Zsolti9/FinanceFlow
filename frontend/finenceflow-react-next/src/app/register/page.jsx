"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./register.module.css";

export default function RegisterPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fullName,
        email : email,
        password: password,
      }),
    });

    if (res.ok) {
      alert("Sikeres regisztráció!");
      router.push("/login");
    } else {
      alert("Hiba történt.");
    }
  };

  return (
    <div className={styles.RegisterWrapper}>
      
      {/* BAL FELSŐ FIX LOGO */}
      <div className={styles.TopLogo} onClick={() => router.push("/")}>
        <Image 
          src="/FinanceFlowLogo.png"
          width={100}
          height={100}
          alt="FinanceFlow Logo"
        />
      </div>

      <div className={styles.RegisterBox}>
        <h2 className={styles.RegisterTitle}>Regisztráció</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Teljes név"
            className={styles.RegisterInput}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            className={styles.RegisterInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Jelszó"
            className={styles.RegisterInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.RegisterBtn}>
            Regisztráció
          </button>
        </form>

        <span
          className={styles.RegisterSwitchLink}
          onClick={() => router.push("/login")}
        >
          Van már fiókod? Jelentkezz be!
        </span>
      </div>
    </div>
  );
}
