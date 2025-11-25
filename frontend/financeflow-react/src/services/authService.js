const BASE_URL = "https://localhost:7150"; // backend alap URL (az API host + portod)

export async function login(email, password) {
  const response = await fetch(
    `${BASE_URL}/login?useCookies=false`,  // tokenes auth
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await response.json();
  return data;
}

export async function registerUser(email, password) {
  const response = await fetch(
    `${BASE_URL}/register`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );
  const data = await response.json();
  return data;
}

export async function refreshToken(refreshToken) {
  const response = await fetch(
    `${BASE_URL}/refresh`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }
  );
  return response.json();
}