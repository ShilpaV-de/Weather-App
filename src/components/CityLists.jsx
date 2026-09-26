/** Recent searches + favorite cities, both persisted in localStorage. */
export default function CityLists({
  recent,
  favorites,
  onSelect,
  onClearRecent,
  onRemoveFavorite,
  disabled,
}) {
  const hasRecent = Array.isArray(recent) && recent.length > 0;
  const hasFavorites = Array.isArray(favorites) && favorites.length > 0;

  if (!hasRecent && !hasFavorites) return null;

  return (
    <div className="city-lists">
      {hasRecent && (
        <section className="card" aria-label="Recent searches">
          <div className="card-head row-between">
            <h2>Recent searches</h2>
            <button type="button" className="link-btn" onClick={onClearRecent} disabled={disabled}>
              Clear
            </button>
          </div>
          <ul className="chip-list">
            {recent.map((city) => (
              <li key={city}>
                <button
                  type="button"
                  className="chip"
                  onClick={() => onSelect(city)}
                  disabled={disabled}
                  aria-label={`Load weather for ${city}`}
                >
                  {city}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasFavorites && (
        <section className="card" aria-label="Favorite cities">
          <div className="card-head">
            <h2>Favorite cities</h2>
          </div>
          <ul className="chip-list">
            {favorites.map((city) => (
              <li key={city} className="chip-wrap">
                <button
                  type="button"
                  className="chip chip-fav"
                  onClick={() => onSelect(city)}
                  disabled={disabled}
                  aria-label={`Load weather for favorite city ${city}`}
                >
                  <span aria-hidden="true">♥ </span>
                  {city}
                </button>
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => onRemoveFavorite(city)}
                  aria-label={`Remove ${city} from favorites`}
                  title={`Remove ${city}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
