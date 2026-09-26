import "./SearchBox.css";
import { useState } from "react";

/**
 * Search input (previously MUI-based). Controlled locally, submits a
 * trimmed city name to the parent. Preserves: Enter-to-search, empty
 * prevention, disabled-while-loading.
 */
export default function SearchBox({ onSearch, loading }) {
  const [city, setCity] = useState("");
  const [hint, setHint] = useState("");

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const clean = city.trim().replace(/\s+/g, " ");
    if (!clean) {
      setHint("Please enter a city name.");
      return;
    }
    setHint("");
    setCity("");
    await onSearch(clean);
  };

  return (
    <div className="SearchBox">
      <form role="search" aria-label="Search weather by city" onSubmit={handleSubmit}>
        <label className="sr-only" htmlFor="city-input">
          City name
        </label>
        <div className="search-row">
          <span className="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            id="city-input"
            name="city"
            type="search"
            autoComplete="off"
            placeholder="Search any city… (e.g. Pune)"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              if (hint) setHint("");
            }}
            disabled={loading}
            aria-describedby={hint ? "city-hint" : undefined}
          />
          <button type="submit" className="btn btn-primary" disabled={loading || !city.trim()}>
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>
      {hint && (
        <p id="city-hint" className="search-hint" role="alert">
          {hint}
        </p>
      )}
    </div>
  );
}
