const API_KEY = import.meta.env.VITE_OWM_API_KEY;


export async function getForecastByCoords(lat, lon) {
  if (!API_KEY) {
    const err = new Error("API key não encontrada (VITE_OWM_API_KEY).");
    err.code = "NO_KEY";
    throw err;
  }

  const url =
    `https://api.openweathermap.org/data/2.5/forecast` +
    `?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  const res = await fetch(url);

  if (!res.ok) {
    let body = "";
    try { body = await res.text(); } catch {}
    const err = new Error(`OpenWeather ${res.status}: ${body}`);
    err.code = res.status; // 401, 429 etc.
    throw err;
  }

  return res.json();
}
