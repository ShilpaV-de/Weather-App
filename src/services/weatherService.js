// Weather API service layer — UI components must call these helpers
// instead of fetch() directly. Keeps API logic separate from presentation.
//
// Preserves the existing integration:
//   Base:   VITE_OPENWEATHER_API_URL (fallback: https://api.openweathermap.org/data/2.5)
//   Key:    VITE_OPENWEATHER_API_KEY (legacy fallback: VITE_API_KEY / VITE_API_URL)
// The key is never hardcoded and never logged.

const BASE_URL =
  import.meta.env.VITE_OPENWEATHER_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://api.openweathermap.org/data/2.5";

const API_KEY =
  import.meta.env.VITE_OPENWEATHER_API_KEY || import.meta.env.VITE_API_KEY;

export const hasApiKey = () => Boolean(API_KEY);

/** Friendly error with a machine-readable `code` for the UI to map. */
export class WeatherApiError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "WeatherApiError";
    this.code = code;
  }
}

function ensureApiKey() {
  if (!API_KEY) {
    throw new WeatherApiError(
      "API_KEY_MISSING",
      "Weather service is not configured. Please add your OpenWeather API key to the .env file."
    );
  }
}

async function parseResponse(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    const apiMessage = body && typeof body.message === "string" ? body.message : "";
    const cod = body && body.cod !== undefined ? String(body.cod) : String(res.status);
    if (cod === "404" || res.status === 404) {
      throw new WeatherApiError("CITY_NOT_FOUND", "city-not-found");
    }
    if (cod === "401" || res.status === 401) {
      throw new WeatherApiError(
        "API_KEY_INVALID",
        "The weather service rejected the API key. Please check the configured key."
      );
    }
    if (res.status === 429) {
      throw new WeatherApiError(
        "RATE_LIMITED",
        "Too many requests right now. Please wait a moment and try again."
      );
    }
    throw new WeatherApiError(
      "API_ERROR",
      apiMessage || `Weather service returned status ${res.status}.`
    );
  }

  return body;
}

async function request(path, params) {
  ensureApiKey();
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  url.searchParams.set("appid", API_KEY);
  url.searchParams.set("units", "metric");

  let res;
  try {
    res = await fetch(url.toString());
  } catch {
    throw new WeatherApiError(
      "NETWORK_ERROR",
      "network-error"
    );
  }
  return parseResponse(res);
}

/**
 * Normalise the /weather payload into the shape the UI consumes.
 * Always fetches metric; °F conversion happens locally in the UI.
 */
export function normalizeCurrentWeather(json, labelFallback = "") {
  if (!json || typeof json !== "object" || !json.main || !json.weather?.[0]) {
    throw new WeatherApiError("BAD_RESPONSE", "The weather service returned an unexpected response.");
  }
  const [primary] = json.weather;
  return {
    city: json.name || labelFallback || "Unknown location",
    country: json.sys?.country || "",
    temp: Number(json.main.temp),
    feelsLike: Number(json.main.feels_like),
    tempMin: Number(json.main.temp_min),
    tempMax: Number(json.main.temp_max),
    humidity: Number(json.main.humidity),
    pressure: Number(json.main.pressure),
    visibility: typeof json.visibility === "number" ? json.visibility : null,
    windSpeed: Number(json.wind?.speed ?? 0),
    windDeg: typeof json.wind?.deg === "number" ? json.wind.deg : null,
    clouds: Number(json.clouds?.all ?? 0),
    conditionMain: primary.main || "Unknown",
    conditionDesc: primary.description || "",
    icon: primary.icon || "01d",
    dt: typeof json.dt === "number" ? json.dt : null,
    timezone: typeof json.timezone === "number" ? json.timezone : 0,
    sunrise: json.sys?.sunrise ?? null,
    sunset: json.sys?.sunset ?? null,
    coord: json.coord ? { lat: json.coord.lat, lon: json.coord.lon } : null,
  };
}

export async function fetchCurrentByCity(city) {
  const clean = city.trim();
  if (!clean) throw new WeatherApiError("EMPTY_QUERY", "empty-query");
  const json = await request("/weather", { q: clean });
  return normalizeCurrentWeather(json, clean);
}

export async function fetchCurrentByCoords(lat, lon) {
  const json = await request("/weather", { lat, lon });
  return normalizeCurrentWeather(json, "Current location");
}

async function fetchForecastRaw(params) {
  const json = await request("/forecast", params);
  if (!json || !Array.isArray(json.list)) {
    throw new WeatherApiError("BAD_RESPONSE", "The forecast service returned an unexpected response.");
  }
  return json;
}

export function fetchForecastByCity(city) {
  const clean = city.trim();
  if (!clean) throw new WeatherApiError("EMPTY_QUERY", "empty-query");
  return fetchForecastRaw({ q: clean });
}

export function fetchForecastByCoords(lat, lon) {
  return fetchForecastRaw({ lat, lon });
}

/**
 * Fetch current weather + 5-day / 3-hour forecast together.
 * Forecast is best-effort: if it fails (e.g. plan restriction),
 * current weather is still returned with `forecast: null`.
 */
export async function fetchWeatherAndForecast({ city, lat, lon }) {
  const isCoords = lat !== undefined && lon !== undefined;
  const currentParams = isCoords ? { lat, lon } : { q: city.trim() };

  const currentJson = await request("/weather", currentParams);
  const current = normalizeCurrentWeather(
    currentJson,
    isCoords ? "Current location" : city.trim()
  );

  try {
    const forecastJson = await request("/forecast", currentParams);
    if (forecastJson && Array.isArray(forecastJson.list)) {
      return { current, forecastRaw: forecastJson, forecastAvailable: true };
    }
  } catch {
    // Intentionally fall through — forecast section will be hidden.
  }
  return { current, forecastRaw: null, forecastAvailable: false };
}

/** Map internal error codes to user-facing messages (never raw API text). */
export function toUserMessage(err) {
  if (!err) return "";
  if (err instanceof WeatherApiError) {
    switch (err.code) {
      case "CITY_NOT_FOUND":
      case "empty-query":
        return "No such place exists. Please check the city name.";
      case "NETWORK_ERROR":
      case "network-error":
        return "Unable to reach the weather service. Check your connection and try again.";
      case "API_KEY_MISSING":
        return "Weather service is not configured. Add your OpenWeather API key to the .env file.";
      case "API_KEY_INVALID":
        return "The weather service rejected the API key. Please check the configured key.";
      case "RATE_LIMITED":
        return "Too many requests right now. Please wait a moment and try again.";
      case "GEOLOCATION_DENIED":
        return "Location access was denied. Please search for a city manually.";
      case "GEOLOCATION_UNAVAILABLE":
        return "Your location is unavailable on this device. Please search for a city manually.";
      case "GEOLOCATION_TIMEOUT":
        return "Getting your location timed out. Please try again or search for a city.";
      default:
        return "Something went wrong while loading weather data. Please try again.";
    }
  }
  return "Something went wrong while loading weather data. Please try again.";
}
