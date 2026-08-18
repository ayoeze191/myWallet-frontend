import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { safeNext } from "../lib/nav";
import { AuthLayout } from "../components/AuthLayout";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Someone who arrived from an Ajo invite goes back to it after signing up.
  const next = safeNext(searchParams.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      navigate(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Open a wallet"
      subtitle="It takes a minute. No fee to create an account."
    >
      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input
            id="name"
            placeholder="Ada Okeke"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="At least 8 characters"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary btn-block btn-lg"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner" />
              Opening…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <p className="auth-alt">
        Already have a wallet?{" "}
        <Link to={`/login?next=${encodeURIComponent(next)}`}>Log in</Link>
      </p>
    </AuthLayout>
  );
}
