import { useState } from "react";

/** useState persisted to localStorage (JSON-serialised). */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw);
    } catch {
      // Corrupt entry — fall back to the default below.
    }
    return typeof initialValue === "function" ? initialValue() : initialValue;
  });

  const setStoredValue = (next) => {
    setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        // Storage full / unavailable — keep in-memory value.
      }
      return resolved;
    });
  };

  return [value, setStoredValue];
}
