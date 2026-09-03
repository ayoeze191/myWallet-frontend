# Ajo — frontend

The React client for **Ajo**, a rotating-savings app: fund a wallet, start a
savings circle, share a link, and let the rounds pay out on their own.

An **ajo** (also *esusu*, or a ROSCA) is a savings club — a group agrees on an
amount and a rhythm, everyone pays in each round, and one member takes the
whole pot each time until everybody has had a turn.

This is a single-page app talking to the Ajo API over `fetch`. It has no state
library, no component library and no CSS framework — one `api.js` module, one
auth context, and one hand-written stylesheet.

> Needs the backend running. It lives in its own repository (`wallet-system`);
> start it on port 4000 before `npm run dev` here.

---

## Stack

| Piece | Choice |
|---|---|
| Framework | React 19 |
| Build | Vite 8 (`@vitejs/plugin-react`) |
| Routing | React Router 7 |
| Icons | `lucide-react` |
| Lint | Oxlint |
| Styling | one plain CSS file with custom properties |

---

## Quick start

```bash
npm install
cp .env.example .env      # only needed if the API isn't on localhost:4000
npm run dev               # http://localhost:5173
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built `dist/` locally |
| `npm run lint` | Oxlint |

### Environment

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:4000` | Where the API lives |

Note the backend's CORS `origin` is currently pinned to
`http://localhost:5173`, so if you serve this app from a different origin you
have to widen that on the server side too.

---

## Routes

| Path | Guard | Page |
|---|---|---|
| `/` | – | `LandingPage` when signed out, `DashboardPage` when signed in |
| `/login` | – | `LoginPage`, honours `?next=` |
| `/register` | – | `RegisterPage` |
| `/join/:code` | – | `JoinPage` — invite preview, then join |
| `/contributions` | auth | `ContributionsPage` — my circles + create form |
| `/contributions/:id` | auth | `ContributionDetailPage` — members, rounds, payout order |

`/join/:code` is intentionally **outside** the auth guard. An invite arrives on
WhatsApp from someone who may not have an account yet, so the page previews the
circle first (via the public `GET /invites/:code`) and only then asks them to
sign in or register.

The dashboard's four views — overview, fund, transfer, history — are tabs
rather than routes, and the active tab lives in the URL as `?tab=`. That's what
lets the sidebar link straight into "Send Money" and lets a reload keep you
where you were.

---

## Layout

```
src/
  api.js                  every backend call, in one place
  App.jsx                 routes + providers
  main.jsx                entry
  auth/
    AuthContext.jsx       token + user, persisted to localStorage
    RequireAuth.jsx       redirects to /login?next=… when signed out
  components/
    AuthLayout.jsx        shared shell for login/register
    Sidebar.jsx           app nav, collapses to an overlay on mobile
    LedgerTable.jsx       credit/debit rows + the shared formatMoney()
    ChatWidget.jsx        the help bubble
  lib/
    chatbot.js            rules-based knowledge base behind ChatWidget
    format.js             money/date formatting, FREQUENCY_LABEL, todayISO()
    nav.js                safeNext() — sanitises ?next= redirects
  pages/                  the screens listed above
  styles/global.css       design tokens + every component style
```

`WalletsPage.jsx` and `WalletDetailPage.jsx` are leftovers from the pre-Ajo,
multi-wallet version of the UI. Nothing routes to them; they're safe to delete.

---

## How the pieces fit

**One API module.** Everything the app knows how to ask the server for is in
[src/api.js](src/api.js) — one `request()` helper that attaches the bearer
token, parses the body, and throws `data.message || data.error` on a non-2xx
so every caller can just `catch (err) { setError(err.message) }`.

**Auth is a context over localStorage.** `AuthProvider` seeds `token` and
`user` from `localStorage` on first render, so a refresh doesn't sign you out,
and `login`/`register`/`logout` keep both in sync. `api.js` reads the token
back out of `localStorage` per request rather than being handed it, which
keeps the two from drifting apart.

**Idempotency keys are generated per click.** `fundWallet` and `transfer` both
mint a fresh `crypto.randomUUID()` into an `Idempotency-Key` header, which the
API requires. A double-submitted transfer returns the first result instead of
sending money twice.

**Two details that are easy to get wrong:**

- `safeNext()` in [src/lib/nav.js](src/lib/nav.js) rejects any `?next=` value
  that isn't a same-origin path. Without it, a crafted `/login?next=https://…`
  link would bounce a freshly-signed-in user onto someone else's site — and a
  leading `//` counts as another host too.
- `formatDay()` in [src/lib/format.js](src/lib/format.js) splits
  `'2026-08-21'` by hand instead of calling `new Date(str)`. The built-in parse
  reads a bare date as UTC midnight and renders the *previous* day west of
  Greenwich. An Ajo due date is a calendar day, not an instant, and is carried
  as one from Postgres all the way to the screen.

**The help bubble doesn't call anything.** `lib/chatbot.js` is a rules-based
knowledge base: topics with weighted keywords, scored against what the user
typed. Deliberately not a model call — every answer is one the project can
stand behind, it costs nothing per message, it replies instantly, and it can't
invent a feature that doesn't exist. When nothing scores well enough it says so
and points at the FAQ rather than guessing.

---

## Design notes

The palette and layout language are set as custom properties at the top of
[src/styles/global.css](src/styles/global.css) — brand green `#07A450`, deep
forest `#002813`, warm neutral greys, plus semantic `--credit` / `--debit`
colours the ledger leans on.

Three typefaces, each with a job: **Plus Jakarta Sans** for display, **Inter**
for body text, **IBM Plex Mono** for micro-labels and for every number that
belongs in a column. Money is always mono and tabular so figures line up
digit-for-digit down the ledger.

The ledger table is the piece the rest of the UI defers to. Credits and debits
get ink-stamp badges rather than coloured text alone, and the surrounding
chrome stays quiet so the numbers carry the screen.

Everything is light-mode only. The responsive work is desktop-first —
`max-width` breakpoints at 1024, 900, 768 and 560px — with the sidebar turning
into a dismissable overlay under the mobile breakpoint and the dashboard's tab
strip scrolling sideways instead of wrapping. Animations respect
`prefers-reduced-motion`.

---

## Known gaps

- **The JWT is stored in `localStorage`**, which is readable by any script that
  makes it onto the page. Fine for a demo; a production build should move to an
  httpOnly cookie.
- **Nothing reacts to an expired token.** After seven days, calls start failing
  with "Invalid or expired token" and the user has to sign out manually — the
  API client doesn't intercept a 401 and redirect to `/login`.
- **No polling.** Round progress updates when you reload or press "Check for
  due rounds now"; the page doesn't watch for the server's background sweep.
- **No tests.** No unit tests and no end-to-end coverage.
- `WalletsPage` / `WalletDetailPage` are dead code (see Layout above).
