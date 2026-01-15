export function makeMockForecast(cityName) {
  const base =
    cityName === "Vancouver" ? -4 :
    cityName === "London" ? 13 :
    27;

  const timezone = 0;
  const now = Math.floor(Date.now() / 1000);

  const list = Array.from({ length: 40 }).map((_, i) => ({
    dt: now + i * 3 * 3600,
    main: { temp: base + (i % 5) - 2 },
    weather: [{ main: "Clear", description: "clear sky" }],
  }));

  return { city: { timezone }, list };
}
