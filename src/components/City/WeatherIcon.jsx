const ICONS = {
  sun: "/icons/sun.svg",
  moon: "/icons/moon.svg",
  cloudsun: "/icons/cloudsun.svg",
};

function pickIconKey(weatherId, owmIcon) {
  const isNight = String(owmIcon || "").endsWith("n");

  // clear
  if (weatherId === 800) return isNight ? "moon" : "sun";

  // clouds
  if (weatherId >= 801 && weatherId <= 804) return "cloudsun";

  // chuva/neve/temporal/etc (fallback simples)
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
    />
  );
}
