"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "./profile.module.css";

const API_BASE = "https://localhost:7183";

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [profileImage, setProfileImage] = useState(null);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* AUTH + USER LOAD (BACKEND) */
  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE}/api/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        if (data.profileImage) {
          setProfileImage(`${API_BASE}${data.profileImage}?t=${Date.now()}`);
        }
      })
      .catch(() => {
        localStorage.clear();
        router.replace("/login");
      });
  }, [token, router]);

  /* THEME */
  useEffect(() => {
    setIsDarkMode(localStorage.getItem("darkMode") !== "false");
  }, []);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      alert("Csak PNG fájl tölthető fel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/users/profile-image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      alert("Hiba a feltöltés során");
      return;
    }

    const data = await res.json();
    setProfileImage(`${API_BASE}${data.imageUrl}?t=${Date.now()}`);
  }

  function logout() {
    localStorage.clear();
    router.push("/");
  }

  if (!user) {
    return <div className={styles.loading}>Betöltés...</div>;
  }

  /* 🔥 UGYANAZ A LOGIKA, MINT HOME-ON */
  const displayName =
    user.username ||
    user.userName ||          // 👈 EZ MOST MÁR VAN
    user.displayName ||
    user.DisplayName ||
    user.email?.split("@")[0] ||
    "Felhasználó";

  return (
    <div
      className={`${styles.ProfileBackground} ${
        isDarkMode ? styles.dark : styles.light
      }`}
    >
      {/* NAVBAR */}
      <nav className={styles.Navbar}>
        <div className={styles.NavLeft} onClick={() => router.push("/home")}>
          <Image
            src="/FinanceFlowLogo.png"
            width={120}
            height={40}
            alt="FinanceFlow"
          />
        </div>

        <button className={styles.BackBtn} onClick={() => router.push("/home")}>
          ← Vissza
        </button>
      </nav>

      {/* CONTENT */}
      <div className={styles.Content}>
        <div className={styles.ProfileCard}>
          {/* AVATAR */}
          <div
            className={styles.Avatar}
            onClick={() => fileInputRef.current.click()}
          >
            {profileImage ? (
              <img src={profileImage} alt="Profilkép" />
            ) : (
              "👤"
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png"
              hidden
              onChange={handleImageUpload}
            />
          </div>

          <p className={styles.UploadHint}>
            Kattints a képre a feltöltéshez (PNG)
          </p>

          <h1>{displayName}</h1>
          <p className={styles.Email}>{user.email}</p>

          <div className={styles.InfoGrid}>
            <div>
              <span>Felhasználónév</span>
              <strong>{displayName}</strong>
            </div>

            <div>
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>
          </div>

          <div className={styles.Actions}>
            <button onClick={() => router.push("/settings")}>
              ⚙️ Beállítások
            </button>

            <button className={styles.Logout} onClick={logout}>
              🚪 Kijelentkezés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
