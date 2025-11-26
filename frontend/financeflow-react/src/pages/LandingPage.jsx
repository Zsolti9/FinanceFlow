import { useNavigate } from "react-router-dom";
import "../css/LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="LandingDiv">
      {/* NAVBAR (GitHub-stílus) */}
      <nav className="Navbar">
        <div className="Logo">FinanceFlow</div>

        <div className="NavLinks">
          <span onClick={() => navigate("/login")}>Bejelentkezés</span>
          <span onClick={() => navigate("/register")}>Regisztráció</span>
        </div>
      </nav>

      {/* HERO – mint GitHub-on */}
      <div className="Hero">
        <h1>Pénzügyek egyszerűen és átláthatóan.</h1>
        <p>Kezeld a kiadásaidat és bevételeidet modern, letisztult felületen.</p>
      </div>
    </div>
  );
}
