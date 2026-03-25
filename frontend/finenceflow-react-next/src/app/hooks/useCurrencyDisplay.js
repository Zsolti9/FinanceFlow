"use client";

import { useEffect, useMemo, useState } from "react";

const SUPPORTED = ["HUF", "EUR", "USD"];
const API_BASE = "https://localhost:7183";
const FALLBACK_RATES = {
  HUF: 1,
  EUR: 1 / 390,
  USD: 1 / 360,
};

const LOCALE_BY_CURRENCY = {
  HUF: "hu-HU",
  EUR: "de-DE",
  USD: "en-US",
};

export default function useCurrencyDisplay() {
  const [currency, setCurrency] = useState(() => {
    if (typeof window === "undefined") return "HUF";
    const stored = localStorage.getItem("defaultCurrency");
    return SUPPORTED.includes(stored) ? stored : "HUF";
  });
  const [rates, setRates] = useState(FALLBACK_RATES);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    async function loadSavedCurrencyFromDb() {
      try {
        const res = await fetch(`${API_BASE}/api/users/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;

        const data = await res.json();
        const dbCurrency = data?.defaultCurrency;
        if (!SUPPORTED.includes(dbCurrency)) return;

        setCurrency(dbCurrency);
        localStorage.setItem("defaultCurrency", dbCurrency);
      } catch {
        // localStorage fallback marad
      }
    }

    loadSavedCurrencyFromDb();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadRates() {
      try {
        const res = await fetch(
          "https://api.frankfurter.app/latest?from=HUF&to=EUR,USD",
          { signal: controller.signal }
        );
        if (!res.ok) return;
        const data = await res.json();
        const nextRates = {
          HUF: 1,
          EUR: Number(data?.rates?.EUR || FALLBACK_RATES.EUR),
          USD: Number(data?.rates?.USD || FALLBACK_RATES.USD),
        };
        setRates(nextRates);
      } catch {
        // fallback rates maradnak
      }
    }

    loadRates();
    return () => controller.abort();
  }, []);

  const formatFromHuf = useMemo(
    () => (value) => {
      const amountHuf = Number(value || 0);
      const rate = rates[currency] ?? 1;
      const converted = amountHuf * rate;

      return new Intl.NumberFormat(LOCALE_BY_CURRENCY[currency] ?? "hu-HU", {
        style: "currency",
        currency,
        maximumFractionDigits: currency === "HUF" ? 0 : 2,
      }).format(converted);
    },
    [currency, rates]
  );

  return { currency, formatFromHuf };
}