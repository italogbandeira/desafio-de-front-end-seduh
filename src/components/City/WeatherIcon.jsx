const BASE = import.meta.env.BASE_URL;

const ICONS = {
  sun: `${BASE}icons/sun.svg`,
  moon: `${BASE}icons/moon.svg`,
  cloudsun: `${BASE}icons/cloudsun.svg`,
};

function pickIconKey(weatherId, owmIcon) {
  const isNight = String(owmIcon || "").endsWith("n");

  if (weatherId === 800) return isNight ? "moon" : "sun";
  if (weatherId >= 801 && weatherId <= 804) return "cloudsun";
  if (weatherId >= 200 && weatherId < 800) return "cloudsun";

  return isNight ? "moon" : "sun";
}

export default function WeatherIcon({
  weatherId,
  owmIcon,
  size = 96,
  invert = false,
  alt = "",
  className = "",
}) {
  const key = pickIconKey(Number(weatherId), owmIcon);
  const src = ICONS[key] || ICONS.sun;

  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        display: "block",
        filter: invert ? "invert(1)" : "none",
      }}
      onError={(e) => {
        console.error("Falhou carregar ícone:", src);
        e.currentTarget.style.display = "none";
      }}
    />
  );
}
