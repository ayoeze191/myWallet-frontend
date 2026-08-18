/**
 * Sanitise a `?next=` redirect target.
 *
 * Only same-origin paths are allowed. Without this check a crafted link like
 * /login?next=https://evil.example could bounce a freshly-logged-in user
 * straight onto someone else's site. A leading `//` is rejected too — the
 * browser reads that as a protocol-relative URL to another host.
 */
export function safeNext(value, fallback = "/") {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
