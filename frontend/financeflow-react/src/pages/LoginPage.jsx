import "../css/LoginPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/FinanceFlowLogo.png";


export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      alert("Sikeres bejelentkezés!");
      navigate("/home");
    } else {
      const data = await response.json();
      alert("Hiba: " + JSON.stringify(data));
    }
  };

  return (
    <div className="LoginWrapper">
      <div className="CornerLogo" onClick={() => navigate("/")}>
  <img src={logo} alt="Logo" />
</div>

      <div className="LoginBox">

        <h2 className="LoginTitle">Bejelentkezés</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="LoginInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="LoginInput"
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="LoginBtn" type="submit">
            Bejelentkezés
          </button>
        </form>

        <span className="LoginSwitchLink" onClick={() => navigate("/register")}>
          Nincs még fiókod? Regisztrálj!
        </span>
      </div>
    </div>
  );
}
