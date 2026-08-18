export const FREQUENCY_LABEL = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

/**
 * Ajo dates are calendar days ('2026-08-21'), not instants. Parsing one with
 * `new Date(str)` would read it as UTC midnight and render the day before in
 * any timezone west of Greenwich, so the parts are split by hand.
 */
export function formatDay(value) {
  if (!value) return "—";
  const [y, m, d] = String(value).slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return String(value);
  return new Date(y, m - 1, d).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Today, as the same 'YYYY-MM-DD' shape the API uses. */
export function todayISO() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
