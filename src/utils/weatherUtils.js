// Pure helpers: unit conversion, icons, backgrounds, date formatting.
// No API calls here. All temperature data is stored in °C and converted locally
// so switching °C/°F never triggers a second network request.

export const CELSIUS = "metric";
export const FAHRENHEIT = "imperial";

export function displayTemp(celsius, unit) {
  if (typeof celsius !== "number" || Number.isNaN(celsius)) return "–";
  const value = unit === FAHRENHEIT ? (celsius * 9) / 5 + 32 : celsius;
  return `${Math.round(value)}`;
}

export function unitSymbol(unit) {
  return unit === FAHRENHEIT ? "°F" : "°C";
}

/** OpenWeather (metric) reports wind in m/s. Display km/h for °C, mph for °F. */
export function displayWind(ms, unit) {
  if (typeof ms !== "number" || Number.isNaN(ms)) return { value: "–", unit: unit === FAHRENHEIT ? "mph" : "km/h" };
  if (unit === FAHRENHEIT) {
    return { value: `${Math.round(ms * 2.23694)}`, unit: "mph" };
  }
  return { value: `${Math.round(ms * 3.6)}`, unit: "km/h" };
}

export function displayVisibility(meters, unit) {
  if (typeof meters !== "number" || Number.isNaN(meters)) return "–";
  if (unit === FAHRENHEIT) {
    return `${(meters / 1609.344).toFixed(1)} mi`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function displayPressure(hpa, unit) {
  if (typeof hpa !== "number" || Number.isNaN(hpa)) return "–";
  if (unit === FAHRENHEIT) {
    return `${(hpa * 0.02953).toFixed(2)} inHg`;
  }
  return `${Math.round(hpa)} hPa`;
}

export function iconUrl(iconCode, size = "2x") {
  const code = iconCode || "01d";
  const density = size === "4x" ? "@4x" : "@2x";
  return `https://openweathermap.org/img/wn/${code}${density}.png`;
}

/**
 * Emoji glyph per OpenWeather "main" condition, so every condition
 * gets a distinct icon even if the remote image fails to load.
 */
export function conditionEmoji(main) {
  switch ((main || "").toLowerCase()) {
    case "clear":
      return "☀️";
    case "clouds":
      return "☁️";
    case "rain":
      return "🌧️";
    case "drizzle":
      return "🌦️";
    case "thunderstorm":
      return "⛈️";
    case "snow":
      return "❄️";
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
    case "dust":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return "🌫️";
    default:
      return "🌤️";
  }
}

export function isNight(iconCode) {
  return typeof iconCode === "string" && iconCode.endsWith("n");
}

/** Background theme key consumed by CSS: bg-clear-day, bg-rain, … */
export function weatherTheme(main, iconCode) {
  const night = isNight(iconCode);
  switch ((main || "").toLowerCase()) {
    case "clear":
      return night ? "clear-night" : "clear-day";
    case "clouds":
      return night ? "clouds-night" : "clouds-day";
    case "rain":
    case "drizzle":
      return "rain";
    case "thunderstorm":
      return "storm";
    case "snow":
      return "snow";
    case "mist":
    case "fog":
    case "haze":
    case "smoke":
    case "dust":
    case "sand":
    case "ash":
    case "squall":
    case "tornado":
      return night ? "fog-night" : "fog-day";
    default:
      return night ? "clear-night" : "default";
  }
}

export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Shift a UTC epoch (seconds) by the location's timezone offset. */
function shiftedDate(epochSeconds, timezoneOffsetSeconds) {
  return new Date((epochSeconds + (timezoneOffsetSeconds || 0)) * 1000);
}

export function formatHour(epochSeconds, timezoneOffsetSeconds) {
  const d = shiftedDate(epochSeconds, timezoneOffsetSeconds);
  const hours = d.getUTCHours();
  const suffix = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12} ${suffix}`;
}

export function formatSunTime(epochSeconds, timezoneOffsetSeconds) {
  if (typeof epochSeconds !== "number") return "–";
  const d = shiftedDate(epochSeconds, timezoneOffsetSeconds);
  const hours = d.getUTCHours();
  const minutes = String(d.getUTCMinutes()).padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${h12}:${minutes} ${suffix}`;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function dayKey(epochSeconds, timezoneOffsetSeconds) {
  const d = shiftedDate(epochSeconds, timezoneOffsetSeconds);
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`;
}

export function dayLabel(epochSeconds, timezoneOffsetSeconds, index) {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const d = shiftedDate(epochSeconds, timezoneOffsetSeconds);
  return `${WEEKDAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`;
}

export function shortDay(epochSeconds, timezoneOffsetSeconds) {
  const d = shiftedDate(epochSeconds, timezoneOffsetSeconds);
  return WEEKDAYS[d.getUTCDay()].slice(0, 3);
}

/** Next N entries from the 3-hourly forecast list (≈24h for N=8). */
export function pickHourly(list, count = 8) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, count).map((item) => ({
    dt: item.dt,
    temp: item.main?.temp,
    icon: item.weather?.[0]?.icon || "01d",
    main: item.weather?.[0]?.main || "",
    desc: item.weather?.[0]?.description || "",
    pop: typeof item.pop === "number" ? Math.round(item.pop * 100) : 0,
  }));
}

/** Collapse 3-hourly entries into one card per day (up to 5 days). */
export function groupDaily(list, timezoneOffsetSeconds) {
  if (!Array.isArray(list)) return [];
  const buckets = new Map();
  for (const item of list) {
    const key = dayKey(item.dt, timezoneOffsetSeconds);
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push(item);
  }
  return [...buckets.values()].slice(0, 5).map((items, index) => {
    const temps = items.map((i) => i.main?.temp).filter((t) => typeof t === "number");
    const representative =
      items.reduce((best, cur) => {
        const hour = shiftedDate(cur.dt, timezoneOffsetSeconds).getUTCHours();
        const bestHour = best ? shiftedDate(best.dt, timezoneOffsetSeconds).getUTCHours() : -99;
        return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? cur : best;
      }, null) || items[0];
    return {
      dt: representative.dt,
      label: dayLabel(representative.dt, timezoneOffsetSeconds, index),
      short: index === 0 ? "Today" : shortDay(representative.dt, timezoneOffsetSeconds),
      min: Math.min(...temps),
      max: Math.max(...temps),
      icon: representative.weather?.[0]?.icon || "01d",
      main: representative.weather?.[0]?.main || "",
      desc: representative.weather?.[0]?.description || "",
    };
  });
}

export function windDirection(deg) {
  if (typeof deg !== "number") return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
