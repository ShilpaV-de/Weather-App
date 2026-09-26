import {
  displayTemp,
  formatHour,
  groupDaily,
  iconUrl,
  pickHourly,
  unitSymbol,
} from "../utils/weatherUtils.js";

/** Hourly (next ~24h) + 5-day forecast from the /forecast endpoint. */
export default function Forecast({ forecastRaw, timezone, unit }) {
  const list = forecastRaw?.list;
  if (!Array.isArray(list) || list.length === 0) return null;

  const hourly = pickHourly(list, 8);
  const daily = groupDaily(list, timezone);

  return (
    <>
      <section className="card forecast" aria-label="Hourly forecast">
        <div className="card-head">
          <h2>Hourly forecast</h2>
          <p className="muted">Next ~24 hours · 3-hour steps</p>
        </div>
        <ol className="hourly-track">
          {hourly.map((h) => (
            <li key={h.dt} className="hourly-item">
              <span className="hourly-time">{formatHour(h.dt, timezone)}</span>
              <img
                src={iconUrl(h.icon)}
                alt={h.desc || h.main}
                width="56"
                height="56"
                loading="lazy"
              />
              <span className="hourly-temp">
                {displayTemp(h.temp, unit)}{unitSymbol(unit)}
              </span>
              <span className="hourly-pop" title="Chance of rain">
                {h.pop > 0 ? `💧 ${h.pop}%` : "—"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="card forecast" aria-label="5-day forecast">
        <div className="card-head">
          <h2>5-day forecast</h2>
          <p className="muted">Daily highs &amp; lows</p>
        </div>
        <ol className="daily-list">
          {daily.map((d) => (
            <li key={d.dt} className="daily-item">
              <span className="daily-day" title={d.label}>
                {d.short}
              </span>
              <img
                src={iconUrl(d.icon)}
                alt={d.desc || d.main}
                width="48"
                height="48"
                loading="lazy"
              />
              <span className="daily-cond">{d.desc || d.main}</span>
              <span className="daily-temps">
                <strong>
                  {displayTemp(d.max, unit)}°
                </strong>
                <span className="muted">
                  {displayTemp(d.min, unit)}°
                </span>
              </span>
              <span className="sr-only">{d.label}: high {displayTemp(d.max, unit)}, low {displayTemp(d.min, unit)}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
