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
  const [loading, setLoading] = useState(false);  // ✅ Loading state
  const [error, setError] = useState("");         // ✅ Hiba state

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // ✅ Password validáció
    if (password.length < 8) {
      setError("A jelszó legalább 8 karakter legyen!");
      setLoading(false);
      return;
    }

    try {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      displayName: fullName,
      email: email,
      password: password,
    }),
  });

  const text = await res.text(); // 🔥 EZ A KULCS

  if (!res.ok) {
    console.error("BACKEND ERROR:", text);
    setError(text || "Regisztráció sikertelen!");
    return;
  }

  alert("Sikeres regisztráció!");
  router.push("/login");

} catch (error) {
  console.error("Fetch hiba:", error);
  setError("Szerver hiba! Ellenőrizd a kapcsolatot.");
} finally {
  setLoading(false);
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

        {error && (
          <div className={styles.ErrorMessage}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Teljes név"
            className={styles.RegisterInput}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email"
            className={styles.RegisterInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Jelszó (min. 8 karakter)"
            className={styles.RegisterInput}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button 
            type="submit" 
            className={`${styles.RegisterBtn} ${loading ? styles.Loading : ""}`}
            disabled={loading}
          >
            {loading ? "Regisztrálás..." : "Regisztráció"}
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
