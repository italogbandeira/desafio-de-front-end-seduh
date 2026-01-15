import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { cities } from "../data/cities";
import { getForecastByCoords } from "../services/openWeather";
import "../styles/ui.css";
import WeatherIcon from "../components/City/WeatherIcon";

function pickSlots(list, timezoneOffsetSeconds) {
  const targets = [
    { label: "Dawn", hour: 3 },
    { label: "Morning", hour: 9 },
    { label: "Afternoon", hour: 15 },
    { label: "Night", hour: 21 },
  ];

  const mapped = (list || []).map((item) => {
    const utcMs = item.dt * 1000;
    const localMs = utcMs + timezoneOffsetSeconds * 1000;
    const d = new Date(localMs);
    return {
      item,
      localHour: d.getUTCHours(),
      localDayKey: `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`,
      localMs,
    };
  });

  const nowLocal = new Date(Date.now() + timezoneOffsetSeconds * 1000);
  const todayKey = `${nowLocal.getUTCFullYear()}-${nowLocal.getUTCMonth()}-${nowLocal.getUTCDate()}`;

  const todayItems = mapped.filter((x) => x.localDayKey === todayKey);
  const pool = todayItems.length ? todayItems : mapped;

  return targets.map((t) => {
    let best = null;
    let bestDiff = Infinity;

    for (const x of pool) {
      const diff = Math.abs(x.localHour - t.hour);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = x.item;
      }
    }

    return {
      label: t.label,
      item: best,
    };
  });
}

/** ✅ min/max do "dia local" (pra setas ↑ ↓) */
function getTodayMinMax(list, timezoneOffsetSeconds) {
  if (!Array.isArray(list) || list.length === 0) return null;

  const toDayKey = (dtSeconds) => {
    const utcMs = dtSeconds * 1000;
    const localMs = utcMs + timezoneOffsetSeconds * 1000;
    const d = new Date(localMs);
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
  };

  const nowUtcSeconds = Math.floor(Date.now() / 1000);
  const todayKey = toDayKey(nowUtcSeconds);

  const todayItems = list.filter((it) => toDayKey(it.dt) === todayKey);
  const pool = todayItems.length ? todayItems : list;

  let min = Infinity;
  let max = -Infinity;

  for (const it of pool) {
    const tMin = it?.main?.temp_min;
    const tMax = it?.main?.temp_max;
    if (typeof tMin === "number") min = Math.min(min, tMin);
    if (typeof tMax === "number") max = Math.max(max, tMax);
  }

  if (!isFinite(min) || !isFinite(max)) return null;
  return { min, max };
}

// ✅ tema por cidade (ajuste como quiser)
function themeForCity(name) {
  switch (name) {
    case "Vancouver":
      return { bg: "#d9d9d9", fg: "#0b0b0b" };
    case "London":
      return { bg: "#2fa7ff", fg: "#ffffff" };
    case "Fairbanks":
      return { bg: "#0b0b0b", fg: "#ffffff" };
    default:
      return { bg: "#0b0b0b", fg: "#ffffff" };
  }
}

function formatTimeFromUnix(unixSeconds, timezoneOffsetSeconds) {
  if (!unixSeconds) return "--:--";
  const ms = unixSeconds * 1000 + timezoneOffsetSeconds * 1000;
  const d = new Date(ms);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function City() {
  const { name } = useParams();

  const city = useMemo(() => {
    const decoded = decodeURIComponent(String(name || ""));
    return cities.find((c) => c.name.toLowerCase() === decoded.toLowerCase());
  }, [name]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!city) return;

    let canceled = false;
    setLoading(true);
    setErr(null);

    getForecastByCoords(city.lat, city.lon)
      .then((json) => {
        if (canceled) return;
        setData(json);
      })
      .catch((e) => {
        if (canceled) return;
        setErr(e);
      })
      .finally(() => {
        if (canceled) return;
        setLoading(false);
      });

    return () => {
      canceled = true;
    };
  }, [city]);

  if (!city) {
    return (
      <main className="screen">
        <section className="card">
          <div className="topBar">
            <Link className="backLink" to="/">
              ← Back
            </Link>
          </div>
          <p>City not found.</p>
        </section>
      </main>
    );
  }

  const theme = themeForCity(city.name);

  const timezone = data?.city?.timezone ?? 0;
  const currentLike = data?.list?.[0] ?? null;

  const description =
    currentLike?.weather?.[0]?.description
      ? currentLike.weather[0].description
      : "";

  const slots = data?.list ? pickSlots(data.list, timezone) : [];

  /** ✅ min/max do dia pra setas */
  const dayRange = data?.list ? getTodayMinMax(data.list, timezone) : null;

  // stats
  const windSpeed = currentLike?.wind?.speed;
  const humidity = currentLike?.main?.humidity;
  const sunrise = data?.city?.sunrise;
  const sunset = data?.city?.sunset;

  // ícone principal
  const mainWeatherId = currentLike?.weather?.[0]?.id;
  const mainOwmIcon = currentLike?.weather?.[0]?.icon;

  const invert = theme.fg === "#ffffff";

  return (
    <main className="screen" style={{ background: theme.bg, color: theme.fg }}>
      <section className="card">
        <div className="topBar">
          <Link className="backLink" to="/" style={{ color: theme.fg }}>
            ← Back
          </Link>
        </div>

        <h2 className="cityName">{city.name}</h2>

        {!loading && description && <p className="weatherDesc">{description}</p>}

        {loading && <p style={{ opacity: 0.7, marginTop: 18 }}>Loading...</p>}

        {!loading && err && (
          <p style={{ opacity: 0.8, marginTop: 18 }}>Failed to load weather.</p>
        )}

        {!loading && !err && currentLike && (
          <>
            {/* ✅ TEMP + MIN/MAX (setas) */}
            <div className="tempRow">
              <div className="temp">
                {Math.round(currentLike.main?.temp ?? 0)}
                <span className="unit">°C</span>
              </div>

              {dayRange && (
                <div className="tempMinMax" aria-label="Min and max temperature">
                  <div className="tempMinMaxItem">
                    <img
                      src="/icons/upperarrow.svg"
                      alt=""
                      className={`minMaxIcon ${invert ? "iconInvert" : ""}`}
                    />
                    <span>{Math.round(dayRange.max)}°</span>
                  </div>

                  <div className="tempMinMaxItem">
                    <img
                      src="/icons/arrowdown.svg"
                      alt=""
                      className={`minMaxIcon ${invert ? "iconInvert" : ""}`}
                    />
                    <span>{Math.round(dayRange.min)}°</span>
                  </div>
                </div>
              )}
            </div>

            {/* ✅ ícone grande */}
            <div className="bigIcon">
              <span className={invert ? "iconInvert" : ""}>
                <WeatherIcon
                  weatherId={mainWeatherId}
                  owmIcon={mainOwmIcon}
                  size={176}
                  alt={description || "weather icon"}
                />
              </span>
            </div>

            {/* ✅ slots com ícone + temp (sem hora) */}
            <div className="times">
              {slots.map((s) => {
                const temp = s.item?.main?.temp;
                const wid = s.item?.weather?.[0]?.id;
                const owm = s.item?.weather?.[0]?.icon;

                return (
                  <div className="timeItem" key={s.label}>
                    <div className="timeLabel">{s.label}</div>

                    <span className={invert ? "iconInvert" : ""}>
                      <WeatherIcon weatherId={wid} owmIcon={owm} size={22} alt="" />
                    </span>

                    <div className="timeValue">
                      {typeof temp === "number" ? `${Math.round(temp)}°C` : "--"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ✅ stats */}
            <div className="statsRow">
              <div className="stat">
                <div className="statLabel">Wind speed</div>
                <div className="statValue">
                  {typeof windSpeed === "number" ? `${windSpeed} m/s` : "--"}
                </div>
              </div>

              <div className="statDivider" />

              <div className="stat">
                <div className="statLabel">Sunrise</div>
                <div className="statValue">{formatTimeFromUnix(sunrise, timezone)}</div>
              </div>

              <div className="statDivider" />

              <div className="stat">
                <div className="statLabel">Sunset</div>
                <div className="statValue">{formatTimeFromUnix(sunset, timezone)}</div>
              </div>

              <div className="statDivider" />

              <div className="stat">
                <div className="statLabel">Humidity</div>
                <div className="statValue">
                  {typeof humidity === "number" ? `${humidity}%` : "--"}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
