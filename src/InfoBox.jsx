import "./InfoBox.css";
import {
  capitalize,
  conditionEmoji,
  displayTemp,
  displayWind,
  iconUrl,
  unitSymbol,
  windDirection,
} from "./utils/weatherUtils.js";

/**
 * Large current-weather hero card. Replaces the old MUI card while keeping
 * the same file/component contract: <InfoBox info={...} />.
 * `info` is the normalised current-weather object from the service layer.
 */
export default function InfoBox({ info, unit, isFavorite, onToggleFavorite }) {
  if (!info) return null;
  const wind = displayWind(info.windSpeed, unit);
  const emoji = conditionEmoji(info.conditionMain);

  return (
    <section className="InfoBox hero-card" aria-label={`Current weather in ${info.city}`}>
      <div className="hero-top">
        <div>
          <p className="eyebrow">Current weather</p>
          <h2 className="hero-city">
            {info.city}
            {info.country ? <span className="hero-country">, {info.country}</span> : null}
          </h2>
          <p className="hero-condition">
            <span aria-hidden="true">{emoji}</span> {capitalize(info.conditionDesc) || info.conditionMain}
          </p>
        </div>
        <button
          type="button"
          className={`fav-btn ${isFavorite ? "is-fav" : ""}`}
          onClick={onToggleFavorite}
          aria-pressed={Boolean(isFavorite)}
          aria-label={isFavorite ? `Remove ${info.city} from favorites` : `Add ${info.city} to favorites`}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <span aria-hidden="true">{isFavorite ? "♥" : "♡"}</span>
          <span>{isFavorite ? "Saved" : "Save"}</span>
        </button>
      </div>

      <div className="hero-main">
        <img
          src={iconUrl(info.icon, "4x")}
          alt={`${info.conditionDesc || info.conditionMain} weather icon`}
          className="hero-icon"
          width="120"
          height="120"
          loading="eager"
        />
        <p className="hero-temp">
          <span className="hero-temp-value">{displayTemp(info.temp, unit)}</span>
          <span className="hero-temp-unit">{unitSymbol(unit)}</span>
        </p>
        <div className="hero-meta">
          <p>
            Feels like <strong>{displayTemp(info.feelsLike, unit)}{unitSymbol(unit)}</strong>
          </p>
          <p>
            H <strong>{displayTemp(info.tempMax, unit)}°</strong> · L{" "}
            <strong>{displayTemp(info.tempMin, unit)}°</strong>
          </p>
        </div>
      </div>

      <dl className="hero-stats">
        <div>
          <dt>Humidity</dt>
          <dd>{info.humidity}%</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>
            {wind.value} {wind.unit}
            {info.windDeg !== null && info.windDeg !== undefined ? ` ${windDirection(info.windDeg)}` : ""}
          </dd>
        </div>
        <div>
          <dt>Pressure</dt>
          <dd>{info.pressure} hPa</dd>
        </div>
        <div>
          <dt>Clouds</dt>
          <dd>{info.clouds}%</dd>
        </div>
      </dl>
    </section>
  );
}
