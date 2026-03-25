"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

const API_BASE = "https://localhost:7183";

export default function SettingsPage() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [message, setMessage] = useState("");

  /* ===== PROFILE ===== */
  const [username, setUsername] = useState("");

  /* ===== PASSWORD ===== */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  /* ===== PREFERENCES ===== */
  const [language, setLanguage] = useState("hu");
  const [currency, setCurrency] = useState("HUF");

  /* ===== NOTIFICATIONS ===== */
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  /* ===== ACCOUNT DELETE ===== */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setIsClient(true), []);

  /* AUTH */
  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [isClient, router]);

  /* THEME */
  useEffect(() => {
    if (!isClient) return;
    setIsDarkMode(localStorage.getItem("darkMode") !== "false");
  }, [isClient]);

  /* LOAD SETTINGS */
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE}/api/users/settings`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;

        setLanguage(data.language ?? "hu");
         const nextCurrency = data.defaultCurrency ?? "HUF";
        setCurrency(nextCurrency);
        localStorage.setItem("defaultCurrency", nextCurrency);
        setNotificationsEnabled(data.notificationsEnabled ?? true);
      })
      .catch((err) => console.error("LOAD SETTINGS ERROR:", err));
  }, [isClient]);

  const themeLabel = useMemo(
    () => (isDarkMode ? "Sötét mód aktív" : "Világos mód aktív"),
    [isDarkMode]
  );

  function toast(text) {
    setMessage(text);
    setTimeout(() => setMessage(""), 2200);
  }

  function toggleTheme() {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    toast(next ? "Sötét mód bekapcsolva." : "Világos mód bekapcsolva.");
  }

  /* ===== API CALLS ===== */

  async function saveUsername() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/users/username`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username }),
    });

    if (!res.ok) {
      toast("❌ Nem sikerült a felhasználónév módosítása.");
      return;
    }

    setUsername("");
    toast("✅ Felhasználónév frissítve.");
  }

  async function changePassword() {
    if (newPassword.length < 8) {
      toast("❌ Az új jelszónak legalább 8 karakteresnek kell lennie.");
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      toast("❌ A jelszavak nem egyeznek.");
      return;
    }

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/users/password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!res.ok) {
      toast("❌ Hibás jelenlegi jelszó.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setNewPasswordConfirm("");
    toast("✅ Jelszó sikeresen módosítva.");
  }

  async function savePreferences() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}/api/users/preferences`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        language,
        defaultCurrency: currency,
        notificationsEnabled,
      }),
    });

    if (!res.ok) {
      toast("❌ Nem sikerült elmenteni.");
      return;
    }

    localStorage.setItem("defaultCurrency", currency);
    toast("✅ Beállítások elmentve.");
  }

  async function deleteAccount() {
    try {
      setDeleting(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/api/auth/delete-me`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!res.ok) {
        toast("❌ Hibás jelszó.");
        return;
      }

      localStorage.clear();
      router.replace("/login");
    } finally {
      setDeleting(false);
    }
  }

  function logout() {
    localStorage.clear();
    router.replace("/login");
  }

  if (!isClient) {
    return (
      <div className={styles.Page}>
        <div className={styles.Card}>Betöltés...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.Page} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.TopBar}>
        <h1 className={styles.Title}>Beállítások</h1>
        <button className={styles.BackBtn} onClick={() => router.push("/home")}>
          ← Vissza
        </button>
      </div>

      {message && <div className={styles.Toast}>{message}</div>}

      {/* ===== PROFIL ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Profil</h2>

        <div className={styles.Row}>
          <input
            className={styles.ModalInput}
            placeholder="Új felhasználónév"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            className={styles.PrimaryBtn}
            disabled={!username}
            onClick={saveUsername}
          >
            💾 Mentés
          </button>
        </div>
      </div>

      {/* ===== BIZTONSÁG ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Biztonság</h2>

        <input
          className={styles.ModalInput}
          type="password"
          placeholder="Jelenlegi jelszó"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          className={styles.ModalInput}
          type="password"
          placeholder="Új jelszó"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <input
          className={styles.ModalInput}
          type="password"
          placeholder="Új jelszó megerősítése"
          value={newPasswordConfirm}
          onChange={(e) => setNewPasswordConfirm(e.target.value)}
        />

        <div style={{ marginTop: "12px" }}>
          <button
            className={styles.PrimaryBtn}
            disabled={!currentPassword || !newPassword}
            onClick={changePassword}
          >
            🔑 Jelszó módosítása
          </button>
        </div>
      </div>

      {/* ===== ÁLTALÁNOS ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Általános</h2>

        <div className={styles.Row}>
          <select
            className={`${styles.ModalInput} ${styles.HomeLikeSelect}`}
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="hu">Magyar</option>
            <option value="en">English</option>
          </select>

          <select
            className={`${styles.ModalInput} ${styles.HomeLikeSelect}`}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="HUF">HUF (Ft)</option>
            <option value="EUR">EUR (€)</option>
            <option value="USD">USD ($)</option>
          </select>

          <button className={styles.PrimaryBtn} onClick={savePreferences}>
            💾 Mentés
          </button>
        </div>
      </div>

      {/* ===== ÉRTESÍTÉSEK ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Értesítések</h2>

        <div className={styles.Row}>
          <span>Értesítések engedélyezése</span>

          <label className={styles.Switch}>
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
            />
            <span className={styles.Slider} />
          </label>
        </div>
      </div>

      {/* ===== MEGJELENÉS ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Megjelenés</h2>

        <div className={styles.Row}>
          <div>
            <div className={styles.Label}>Téma</div>
            <div className={styles.SubLabel}>{themeLabel}</div>
          </div>

          <button className={styles.PrimaryBtn} onClick={toggleTheme}>
            {isDarkMode ? "☀️ Világos mód" : "🌙 Sötét mód"}
          </button>
        </div>
      </div>

      {/* ===== FIÓK ===== */}
      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Fiók</h2>

        <div className={styles.Row}>
          <button className={styles.DangerBtn} onClick={logout}>
            🚪 Kilépés
          </button>

          <button
            className={styles.DangerBtn}
            onClick={() => setShowDeleteModal(true)}
          >
            🗑 Fiók törlése
          </button>
        </div>
      </div>

      {/* ===== DELETE MODAL ===== */}
      {showDeleteModal && (
        <div
          className={styles.ModalOverlay}
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className={styles.ModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.CloseModalBtn}
              onClick={() => setShowDeleteModal(false)}
            >
              ✕
            </button>

            <h2>Fiók törlése</h2>

            <input
              className={styles.ModalInput}
              type="password"
              placeholder="Jelszó"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />

            <div className={styles.ModalActions}>
              <button
                className={styles.SecondaryBtn}
                onClick={() => setShowDeleteModal(false)}
              >
                Mégse
              </button>

              <button
                className={styles.DangerBtn}
                disabled={!deletePassword || deleting}
                onClick={deleteAccount}
              >
                {deleting ? "Törlés..." : "Végleges törlés"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
