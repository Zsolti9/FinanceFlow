"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AppLogo({
  href = "/",
  variant = "nav", // "nav" | "fixed" | "small"
  className = "",
}) {
  const router = useRouter();

  const sizes = {
    nav: { w: 190, h: 60 },     // landing/navbar
    fixed: { w: 110, h: 110 },  // login/register bal felső
    small: { w: 140, h: 44 },   // kisebb navbarok ha kell
  };

  const { w, h } = sizes[variant] ?? sizes.nav;

  return (
    <div
      className={`${variant === "fixed" ? "appLogoFixed" : "appLogoInline"} ${className}`}
      style={{ width: w, height: h }}
      onClick={() => router.push(href)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && router.push(href)}
      aria-label="Ugrás"
    >
      <Image
        src="/FinanceFlowLogo.png"
        alt="FinanceFlow"
        fill
        priority
        style={{ objectFit: "contain" }}
      />
    </div>
  );
}
