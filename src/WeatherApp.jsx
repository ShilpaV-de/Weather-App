import Header from "./components/Header.jsx";
import InfoBox from "./InfoBox.jsx";
import Forecast from "./components/Forecast.jsx";
import WeatherDetails from "./components/WeatherDetails.jsx";
import CityLists from "./components/CityLists.jsx";
import { LoadingSkeleton, ErrorState, EmptyState } from "./components/Feedback.jsx";
import Footer from "./components/Footer.jsx";
import { useLocalStorage } from "./hooks/useLocalStorage.js";
import {
  fetchWeatherAndForecast,
  toUserMessage,
  WeatherApiError,
} from "./services/weatherService.js";
import { FAHRENHEIT, CELSIUS, weatherTheme } from "./utils/weatherUtils.js";
import { useCallback, useEffect, useMemo, useState } from "react";

const MAX_RECENT = 5;

export default function WeatherApp() {
  const [current, setCurrent] = useState(null);
  const [forecastRaw, setForecastRaw] = useState(null);
  const [forecastAvailable, setForecastAvailable] = useState(true);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [unit, setUnit] = useLocalStorage("weather:unit", CELSIUS);
  const [theme, setTheme] = useLocalStorage("weather:theme", "light");
  const [recent, setRecent] = useLocalStorage("weather:recent", []);
  const [favorites, setFavorites] = useLocalStorage("weather:favorites", []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  }, [theme]);

  const background = useMemo(() => {
    if (!current) return "default";
    return weatherTheme(current.conditionMain, current.icon);
  }, [current]);

  const pushRecent = useCallback(
    (city) => {
      const clean = city.trim();
      if (!clean) return;
      setRecent((prev) => {
        const deduped = prev.filter((c) => c.toLowerCase() !== clean.toLowerCase());
        return [clean, ...deduped].slice(0, MAX_RECENT);
      });
    },
    [setRecent]
  );

  const loadCity = useCallback(
    async (rawCity) => {
      const city = (rawCity || "").trim().replace(/\s+/g, " ");
      if (!city) {
        setError("Please enter a city name before searching.");
        return;
      }
      setLoading(true);
      setError("");
      setHasSearched(true);
      try {
        const result = await fetchWeatherAndForecast({ city });
        setCurrent(result.current);
        setForecastRaw(result.forecastRaw);
        setForecastAvailable(result.forecastAvailable);
        pushRecent(result.current.city);
      } catch (err) {
        setError(toUserMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [pushRecent]
  );

  const loadCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    setError("");
    setHasSearched(true);
    try {
      const result = await fetchWeatherAndForecast({ lat, lon });
      setCurrent(result.current);
      setForecastRaw(result.forecastRaw);
      setForecastAvailable(result.forecastAvailable);
      if (result.current.city) {
        setRecent((prev) => {
          const deduped = prev.filter(
            (c) => c.toLowerCase() !== result.current.city.toLowerCase()
          );
          return [result.current.city, ...deduped].slice(0, MAX_RECENT);
        });
      }
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setRecent]);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setError("Geolocation is not supported by this browser. Please search for a city manually.");
      setHasSearched(true);
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        loadCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (geoError) => {
        setLocating(false);
        setHasSearched(true);
        if (geoError.code === 1) {
          setError(toUserMessage(new WeatherApiError("GEOLOCATION_DENIED", "")));
        } else if (geoError.code === 3) {
          setError(toUserMessage(new WeatherApiError("GEOLOCATION_TIMEOUT", "")));
        } else {
          setError(toUserMessage(new WeatherApiError("GEOLOCATION_UNAVAILABLE", "")));
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, [loadCoords]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, [setTheme]);

  const toggleUnit = useCallback(() => {
    // Local conversion only — no second API request.
    setUnit((u) => (u === CELSIUS ? FAHRENHEIT : CELSIUS));
  }, [setUnit]);

  const isFavorite = useMemo(() => {
    if (!current) return false;
    return favorites.some((f) => f.toLowerCase() === current.city.toLowerCase());
  }, [favorites, current]);

  const toggleFavorite = useCallback(() => {
    if (!current) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.toLowerCase() === current.city.toLowerCase());
      if (exists) return prev.filter((f) => f.toLowerCase() !== current.city.toLowerCase());
      return [...prev, current.city].slice(-20);
    });
  }, [current, setFavorites]);

  const showEmpty = !hasSearched && !loading && !current && !error;
  const showSkeleton = loading && !current;

  return (
    <div className={`app bg-${background}`}>
      <Header
        onSearch={loadCity}
        searching={loading}
        onLocate={handleLocate}
        locating={locating}
        unit={unit}
        onUnitChange={toggleUnit}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <main className="container" id="main-content">
        {error && !loading && (
          <ErrorState message={error} />
        )}

        {showSkeleton && <LoadingSkeleton />}

        {showEmpty && <EmptyState />}

        {current && (
          <>
            <InfoBox
              info={current}
              unit={unit}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
            {forecastRaw && !loading && (
              <Forecast forecastRaw={forecastRaw} timezone={current.timezone} unit={unit} />
            )}
            {!forecastAvailable && !loading && (
              <p className="forecast-note" role="note">
                Hourly and daily forecasts are unavailable for this location right now.
              </p>
            )}
            <WeatherDetails info={current} unit={unit} />
          </>
        )}

        {current && loading && (
          <p className="loading-bar" role="status" aria-live="polite">
            Updating weather…
          </p>
        )}

        <CityLists
          recent={recent}
          favorites={favorites}
          onSelect={loadCity}
          onClearRecent={() => setRecent([])}
          onRemoveFavorite={(city) =>
            setFavorites((prev) => prev.filter((f) => f.toLowerCase() !== city.toLowerCase()))
          }
          disabled={loading}
        />
      </main>

      <Footer />
    </div>
  );
}
