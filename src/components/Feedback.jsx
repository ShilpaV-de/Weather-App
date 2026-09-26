function SkeletonBlock({ width = "100%", height = 16 }) {
  return <span className="skel" style={{ width, height }} aria-hidden="true" />;
}

export function LoadingSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-label="Loading weather data">
      <p className="sr-only">Loading weather data…</p>
      <div className="skel-hero card" aria-hidden="true">
        <div className="skel-row-between">
          <SkeletonBlock width="40%" height={22} />
          <SkeletonBlock width="90px" height={32} />
        </div>
        <div className="skel-hero-main">
          <span className="skel skel-circle" />
          <SkeletonBlock width="180px" height={64} />
        </div>
        <div className="skel-grid">
          <SkeletonBlock height={56} />
          <SkeletonBlock height={56} />
          <SkeletonBlock height={56} />
          <SkeletonBlock height={56} />
        </div>
      </div>
      <div className="skel-forecast card" aria-hidden="true">
        <SkeletonBlock width="30%" height={20} />
        <div className="skel-track">
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className="skel skel-chip" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="state-card state-error" role="alert">
      <span className="state-icon" aria-hidden="true">
        ⚠️
      </span>
      <h2>Something needs attention</h2>
      <p>{message || "Something went wrong while loading weather data. Please try again."}</p>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="state-card state-empty">
      <span className="state-icon" aria-hidden="true">
        🌍
      </span>
      <h2>Check the weather anywhere</h2>
      <p>Search for a city to see current conditions and forecasts.</p>
      <ul className="empty-tips">
        <li>Try “Pune”, “London” or “Tokyo”</li>
        <li>Use “My Location” for local weather</li>
      </ul>
    </div>
  );
}
