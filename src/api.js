const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const authToken = localStorage.getItem("wallet_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || data.error || "Request failed");
  }
  return data;
}

function newIdempotencyKey() {
  return crypto.randomUUID();
}

export const api = {
  register: (name, email, password) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  login: (email, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  getMyWallet: () => request("/wallets/me"),

  getMyLedger: () => request("/wallets/me/ledger"),

  lookupUser: (email) =>
    request(`/users/lookup?email=${encodeURIComponent(email)}`),

  fundWallet: (amount, email) =>
    request("/wallets/me/fund", {
      method: "POST",
      headers: { "Idempotency-Key": newIdempotencyKey() },
      body: JSON.stringify({ amount, email }),
    }),

  transfer: (toEmail, amount) =>
    request("/transfers", {
      method: "POST",
      headers: { "Idempotency-Key": newIdempotencyKey() },
      body: JSON.stringify({ toEmail, amount }),
    }),

  listContributions: () => request("/contributions"),

  createContribution: (payload) =>
    request("/contributions", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getContribution: (id) => request(`/contributions/${id}`),

  getInvite: (code) => request(`/invites/${code}`),

  joinContribution: (code) =>
    request(`/invites/${code}/join`, { method: "POST" }),

  setPayoutOrder: (id, slots) =>
    request(`/contributions/${id}/payout-order`, {
      method: "PUT",
      body: JSON.stringify({ slots }),
    }),

  cancelContribution: (id) =>
    request(`/contributions/${id}/cancel`, { method: "POST" }),

  leaveContribution: (id) =>
    request(`/contributions/${id}/leave`, { method: "POST" }),

  runContribution: (id) =>
    request(`/contributions/${id}/run`, { method: "POST" }),
};
