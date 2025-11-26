import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/FinanceFlowLogo.png";
import "../css/HomePage.css";

export default function HomePage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="HomeBackground">
      
      {/* NAVBAR – ugyanaz az elrendezés mint a LandingPage-nél */}
      <nav className="HomeNavbar">

        {/* Bal oldali logo */}
        <div className="HomeNavLeft" onClick={() => navigate("/")}>
          <img src={logo} alt="Logo" className="HomeNavLogo" />
          <span className="HomeNavTitle">FinanceFlow</span>
        </div>

        {/* Hamburger ikon */}
        <div className="Burger" onClick={() => setOpen(!open)}>
          <div className={`bar ${open ? "open" : ""}`}></div>
          <div className={`bar ${open ? "open" : ""}`}></div>
          <div className={`bar ${open ? "open" : ""}`}></div>
        </div>
      </nav>

      {/* Oldalsó hamburger menü */}
      <div className={`HomeMenu ${open ? "show" : ""}`}>
        <span onClick={() => alert("Menüpont 1 később kerül be!")}>
          Menüpont 1
        </span>
        <span onClick={() => alert("Menüpont 2 később kerül be!")}>
          Menüpont 2
        </span>
        <span onClick={logout}>Kijelentkezés</span>
      </div>

      {/* Tartalom */}
      <div className="HomeContent">
        <h1>Üdv újra!</h1>
        <p>Itt fog megjelenni a teljes pénzügyi áttekintésed.</p>
      </div>

    </div>
  );
}
