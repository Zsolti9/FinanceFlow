import "../css/RegisterPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/FinanceFlowLogo.png";

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, email, password }),
      });

      if (response.ok) {
        alert("Sikeres regisztráció!");
        navigate("/login");
      } else {
        const data = await response.json();
        alert("Hiba: " + JSON.stringify(data));
      }
    } catch (error) {
      alert("Nem sikerült csatlakozni a szerverhez.");
      console.error(error);
    }
  };

  return (
    <div className="RegisterWrapper">
      <div className="CornerLogo" onClick={() => navigate("/")}>
  <img src={logo} alt="Logo" />
</div>

      <div className="RegisterBox">

        <h2 className="RegisterTitle">Regisztráció</h2>

        <form onSubmit={handleSubmit}>
          <input
            className="RegisterInput"
            type="text"
            placeholder="Név"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />

          <input
            className="RegisterInput"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="RegisterInput"
            type="password"
            placeholder="Jelszó"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="RegisterBtn" type="submit">
            Regisztrálok
          </button>
        </form>

        <span className="RegisterSwitchLink" onClick={() => navigate("/login")}>
          Van már fiókod? Jelentkezz be!
        </span>

      </div>
    </div>
  );
}
