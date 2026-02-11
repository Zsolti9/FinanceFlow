"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import AppLogo from "../components/AppLogo";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ============================= */
  /*  EMAIL / JELSZÓ LOGIN        */
  /* ============================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://localhost:7183/api/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Hibás adatok!");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/home");
    } catch (error) {
      console.error(error);
      alert("Hiba történt a bejelentkezés során.");
    }
  };

  /* ============================= */
  /*  GOOGLE LOGIN BACKEND CONNECT */
  /* ============================= */

  useEffect(() => {
    // 🔥 CSAK akkor fusson, ha Google redirecttel jöttünk vissza
    const isGoogleLogin = searchParams.get("google") === "true";
    if (!isGoogleLogin) return;

    if (status !== "authenticated") return;
    if (!session?.idToken) return;

    async function loginWithBackend() {
      try {
        const res = await fetch(
          "https://localhost:7183/api/auth/google-login",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken: session.idToken }),
          }
        );

        const text = await res.text();

        if (!res.ok) {
          console.error("Backend error:", text);
          return;
        }

        const data = JSON.parse(text);

        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        router.push("/home");
      } catch (err) {
        console.error(err);
      }
    }

    loginWithBackend();
  }, [status, session?.idToken, searchParams, router]);

  /* ============================= */
  /*              UI               */
  /* ============================= */

  return (
    <div className={styles.LoginWrapper}>
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

        <div className={styles.Divider}>
          <span>vagy</span>
        </div>

        <button
          type="button"
          className={styles.GoogleBtn}
          onClick={() =>
            signIn("google", {
              callbackUrl: "/login?google=true",
              prompt: "select_account",
            })
          }
        >
          Folytatás Google-lel
        </button>

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
