import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const API_URL = "https://localhost:7183/api/Auth";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
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
    } catch (error) {
      alert("Nem sikerült csatlakozni a szerverhez.");
      console.error(error);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Bejelentkezés</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <input
          type="password"
          placeholder="Jelszó"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <br />
        <button type="submit">Bejelentkezés</button>
      </form>
    </div>
  );
}
