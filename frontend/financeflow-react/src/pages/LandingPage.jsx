import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Üdv a FinanceFlow-nál!</h1>
      <button onClick={() => navigate("/login")} style={{ margin: "10px" }}>
        Bejelentkezés
      </button>
      <button onClick={() => navigate("/register")} style={{ margin: "10px" }}>
        Regisztráció
      </button>
    </div>
  );
}
