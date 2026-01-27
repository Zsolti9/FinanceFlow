"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const router = useRouter();

  const [isClient, setIsClient] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [message, setMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Auth check
  useEffect(() => {
    if (!isClient) return;
    const token = localStorage.getItem("token");
    if (!token) router.replace("/login");
  }, [isClient, router]);

  // Theme load
  useEffect(() => {
    if (!isClient) return;
    const dark = localStorage.getItem("darkMode") !== "false";
    setIsDarkMode(dark);
  }, [isClient]);

  const themeLabel = useMemo(
    () => (isDarkMode ? "Sötét mód aktív" : "Világos mód aktív"),
    [isDarkMode]
  );

  function toggleTheme() {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    setMessage(next ? "Sötét mód bekapcsolva." : "Világos mód bekapcsolva.");
    setTimeout(() => setMessage(""), 2000);
  }

  function clearExpensesOnly() {
    localStorage.removeItem("expenses");
    setMessage("A helyi (localStorage) költések törölve.");
    setTimeout(() => setMessage(""), 2000);
  }

  function clearAllLocal() {
    localStorage.clear();
    router.replace("/login");
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login");
  }

  async function deleteAccount() {
    try {
      setDeleting(true);
      setMessage("");

      const token = localStorage.getItem("token");
      const res = await fetch("https://localhost:7183/api/auth/delete-me", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      const text = await res.text();

      if (!res.ok) {
        console.error("DELETE ACCOUNT ERROR:", res.status, text);
        setMessage("❌ Hibás jelszó vagy szerver hiba.");
        return;
      }

      localStorage.clear();
      router.replace("/login");
    } catch (e) {
      console.error(e);
      setMessage("❌ Szerver hiba.");
    } finally {
      setDeleting(false);
    }
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

      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Adatok</h2>

        <div className={styles.Row}>
          <div>
            <div className={styles.Label}>Helyi költések</div>
            <div className={styles.SubLabel}>
              (Régi localStorage mentések, ha maradtak.)
            </div>
          </div>

          <button className={styles.SecondaryBtn} onClick={clearExpensesOnly}>
            🧹 Törlés
          </button>
        </div>

        <div className={styles.Divider} />

        <div className={styles.Row}>
          <div>
            <div className={styles.Label}>Minden helyi adat</div>
            <div className={styles.SubLabel}>
              Token + user + beállítások törlése, majd kiléptet.
            </div>
          </div>

          <button className={styles.DangerBtn} onClick={clearAllLocal}>
            ⚠️ Mindent töröl
          </button>
        </div>
      </div>

      <div className={styles.Card}>
        <h2 className={styles.SectionTitle}>Fiók</h2>

        <div className={styles.Row}>
          <div>
            <div className={styles.Label}>Kijelentkezés</div>
            <div className={styles.SubLabel}>Token törlése és login oldal.</div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
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
      </div>

      {/* ✅ MODAL ITT VAN A RETURN-BEN */}
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
            <p className={styles.ModalText}>
              Biztosan törlöd a fiókodat? Ez végleges, és az összes költésed is
              törlődni fog.
            </p>

            <label className={styles.ModalLabel}>
              Add meg a jelszavad a megerősítéshez:
            </label>

            <input
              className={styles.ModalInput}
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Jelszó"
            />

            <div className={styles.ModalActions}>
              <button
                className={styles.SecondaryBtn}
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                disabled={deleting}
              >
                Mégse
              </button>

              <button
                className={styles.DangerBtn}
                disabled={deleting || !deletePassword}
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
