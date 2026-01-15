const BASE = import.meta.env.BASE_URL; // ex: "/" ou "/meu-app/"

function url(path) {
  return `${BASE}${path}`; // garante base
}

function pickIcon({ weatherId, owmIcon }) {
  const isNight = typeof owmIcon === "string" && owmIcon.endsWith("n");

  const SUN = url("icons/sun.svg");
  const CLOUD_SUN = url("icons/cloudsun.svg");
  const MOON = url("icons/moon.svg");

  if (!weatherId) return isNight ? MOON : SUN;

  if (weatherId === 800) return isNight ? MOON : SUN;
  if (weatherId === 801) return isNight ? MOON : CLOUD_SUN;

  if (weatherId >= 802 && weatherId <= 804) return isNight ? MOON : CLOUD_SUN;

  return isNight ? MOON : CLOUD_SUN;
}

export default function WeatherIcon({
  weatherId,
  owmIcon,
  size = 96,
  alt = "weather icon",
}) {
  const src = pickIcon({ weatherId, owmIcon });

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt={alt}
      style={{ display: "block" }}
      onError={(e) => {
        console.error("Falhou carregar ícone:", src);
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
