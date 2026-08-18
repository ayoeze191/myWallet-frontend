import { Link } from "react-router-dom";
import { UsersIcon, CheckIcon } from "lucide-react";

const POINTS = [
  "A wallet in your own name",
  "Contributions collected automatically",
  "Every movement on a double-entry ledger",
];

/**
 * Split-screen shell for log in / sign up: the brand panel on the left, the
 * form on the right. The panel collapses away below 1024px and the brand
 * lockup reappears above the form instead.
 */
export function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-aside">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark">
            <UsersIcon size={19} />
          </span>
          <span className="brand-word">
            Ajo<span>.</span>
          </span>
        </Link>

        <div className="auth-pitch">
          <h2>The savings circle your family runs, on a real ledger.</h2>
          <p>
            Everyone contributes on the same day. One person collects the pot.
            The books balance every single round.
          </p>
          <ul className="auth-points">
            {POINTS.map((p) => (
              <li key={p}>
                <CheckIcon size={17} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <span className="auth-foot">Payments processed by Paystack</span>
      </aside>

      <main className="auth-main">
        <div className="auth-form">
          <Link to="/" className="brand-lockup auth-form-brand">
            <span className="brand-mark">
              <UsersIcon size={19} />
            </span>
            <span className="brand-word">
              Ajo<span>.</span>
            </span>
          </Link>

          <h1>{title}</h1>
          <p className="auth-form-sub">{subtitle}</p>

          {children}
        </div>
      </main>
    </div>
  );
}
