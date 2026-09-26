import {
  displayPressure,
  displayTemp,
  displayVisibility,
  displayWind,
  formatSunTime,
  unitSymbol,
} from "../utils/weatherUtils.js";

function DetailItem({ icon, label, value, sub }) {
  return (
    <li className="detail-item">
      <span className="detail-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="detail-text">
        <span className="detail-label">{label}</span>
        <strong className="detail-value">{value}</strong>
        {sub ? <span className="detail-sub">{sub}</span> : null}
      </span>
    </li>
  );
}

/** "Weather Details" grid + sunrise/sunset card. */
export default function WeatherDetails({ info, unit }) {
  if (!info) return null;
  const wind = displayWind(info.windSpeed, unit);

  return (
    <>
      <section className="card" aria-label="Weather details">
        <div className="card-head">
          <h2>Weather details</h2>
        </div>
        <ul className="details-grid">
          <DetailItem icon="🤒" label="Feels like" value={`${displayTemp(info.feelsLike, unit)}${unitSymbol(unit)}`} />
          <DetailItem icon="💧" label="Humidity" value={`${info.humidity}%`} />
          <DetailItem
            icon="💨"
            label="Wind"
            value={`${wind.value} ${wind.unit}`}
          />
          <DetailItem icon="🧭" label="Pressure" value={displayPressure(info.pressure, unit)} />
          <DetailItem icon="👁️" label="Visibility" value={displayVisibility(info.visibility, unit)} />
          <DetailItem icon="☁️" label="Cloudiness" value={`${info.clouds}%`} />
        </ul>
      </section>

      <section className="card sun-card" aria-label="Sunrise and sunset">
        <div className="card-head">
          <h2>Sunrise &amp; sunset</h2>
        </div>
        <div className="sun-row">
          <div className="sun-item">
            <span className="sun-icon" aria-hidden="true">
              🌅
            </span>
            <div>
              <p className="detail-label">Sunrise</p>
              <p className="sun-time">{formatSunTime(info.sunrise, info.timezone)}</p>
            </div>
          </div>
          <div className="sun-arc" aria-hidden="true">
            <svg viewBox="0 0 200 60" width="100%" height="56" role="presentation">
              <path d="M8 52 A 92 92 0 0 1 192 52" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0.6" />
              <circle cx="100" cy="12" r="9" fill="currentColor" opacity="0.9" />
            </svg>
          </div>
          <div className="sun-item">
            <span className="sun-icon" aria-hidden="true">
              🌇
            </span>
            <div>
              <p className="detail-label">Sunset</p>
              <p className="sun-time">{formatSunTime(info.sunset, info.timezone)}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
