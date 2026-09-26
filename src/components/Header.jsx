import SearchBox from "../SearchBox.jsx";
import { CELSIUS } from "../utils/weatherUtils.js";

export default function Header({
  onSearch,
  searching,
  onLocate,
  locating,
  unit,
  onUnitChange,
  theme,
  onThemeToggle,
}) {
  const isMetric = unit === CELSIUS;
  const isDark = theme === "dark";

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#" onClick={(e) => e.preventDefault()} aria-label="Weather App home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" aria-hidden="true">
              <path
                d="M7 18a4.5 4.5 0 1 1 .6-8.96A5.5 5.5 0 0 1 18.3 10.5 3.75 3.75 0 0 1 17.5 18H7Z"
                fill="currentColor"
                opacity="0.95"
              />
              <path
                d="M12 3v2.5M5.6 5.6l1.8 1.8M18.4 5.6l-1.8 1.8"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </span>
          <span className="brand-text">
            <span className="brand-name">Weather App</span>
            <span className="brand-sub">Real-time conditions &amp; forecast</span>
          </span>
        </a>

        <div className="header-search">
          <SearchBox onSearch={onSearch} loading={searching} />
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onLocate}
            disabled={searching || locating}
            aria-label="Use my current location"
            title="Use my current location"
          >
            <span aria-hidden="true">{locating ? "…" : "◎"}</span>
            <span className="btn-label">{locating ? "Locating…" : "My Location"}</span>
          </button>

          <div className="unit-toggle" role="group" aria-label="Temperature unit">
            <button
              type="button"
              className={isMetric ? "is-active" : ""}
              aria-pressed={isMetric}
              onClick={() => isMetric || onUnitChange()}
              aria-label="Show temperatures in Celsius"
            >
              °C
            </button>
            <button
              type="button"
              className={!isMetric ? "is-active" : ""}
              aria-pressed={!isMetric}
              onClick={() => !isMetric || onUnitChange()}
              aria-label="Show temperatures in Fahrenheit"
            >
              °F
            </button>
          </div>

          <button
            type="button"
            className="btn btn-icon"
            onClick={onThemeToggle}
            aria-pressed={isDark}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span aria-hidden="true">{isDark ? "☀" : "☾"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
