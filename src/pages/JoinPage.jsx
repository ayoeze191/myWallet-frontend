import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { formatMoney } from "../components/LedgerTable";
import { formatDay, FREQUENCY_LABEL } from "../lib/format";
import { UsersIcon } from "lucide-react";

/**
 * The landing page for a shared invite link.
 *
 * Readable without an account — someone receiving this on WhatsApp should be
 * able to see what they are being invited to before deciding to sign up.
 */
export default function JoinPage() {
  const { code } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .getInvite(code)
      .then((data) => !cancelled && setInvite(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [code]);

  async function handleJoin() {
    setJoining(true);
    setError(null);
    try {
      const { contribution } = await api.joinContribution(code);
      navigate(`/contributions/${contribution.id}`);
    } catch (err) {
      // Already a member? Nothing has gone wrong — just take them there.
      if (err.message?.includes("already joined")) {
        navigate("/contributions");
        return;
      }
      setError(err.message);
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Opening invite…</p>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="join-shell">
        <div className="card">
          <h2 className="card-title">This invite is not valid</h2>
          <p className="ajo-cta-text">
            {error || "The link may have been mistyped."}
          </p>
          <Link to="/" className="btn btn-primary btn-block">
            Go to my wallet
          </Link>
        </div>
      </div>
    );
  }

  // The pot grows as people join, so show what it will be when full.
  const potWhenFull =
    Number(invite.contribution_amount) * Number(invite.member_limit);
  const seatsLeft = invite.member_limit - invite.member_count;
  const joinable = invite.status === "open" && seatsLeft > 0;

  return (
    <div className="join-shell">
      <div className="card join-card">
        <div className="join-crest">
          <UsersIcon size={28} />
        </div>

        <p className="join-kicker">{invite.creator_name} invited you to join</p>
        <h1 className="join-title">{invite.name}</h1>
        {invite.description && (
          <p className="ajo-cta-text">{invite.description}</p>
        )}

        <dl className="join-facts">
          <div>
            <dt>You pay</dt>
            <dd>
              ₦{formatMoney(invite.contribution_amount)}
              <small>{FREQUENCY_LABEL[invite.frequency].toLowerCase()}</small>
            </dd>
          </div>
          <div>
            <dt>You collect</dt>
            <dd>
              ₦{formatMoney(potWhenFull)}
              <small>once, on your turn</small>
            </dd>
          </div>
          <div>
            <dt>Starts</dt>
            <dd>
              {formatDay(invite.start_date)}
              <small>{invite.member_limit} rounds</small>
            </dd>
          </div>
          <div>
            <dt>Members</dt>
            <dd>
              {invite.member_count} / {invite.member_limit}
              <small>
                {seatsLeft > 0 ? `${seatsLeft} seat(s) left` : "full"}
              </small>
            </dd>
          </div>
        </dl>

        {error && <div className="alert alert-error">{error}</div>}

        {!joinable ? (
          <div className="alert alert-error">
            {invite.status === "open"
              ? "This Ajo is already full."
              : `This Ajo is ${invite.status} and is no longer accepting members.`}
          </div>
        ) : token ? (
          <>
            <button
              className="btn btn-primary btn-block"
              onClick={handleJoin}
              disabled={joining}
            >
              {joining ? "Joining…" : "Join this Ajo"}
            </button>
            <p className="join-small">
              Your contribution is taken from your wallet automatically on each
              due date. Keep it funded.
            </p>
          </>
        ) : (
          <>
            {/* Send them back here once they have an account. */}
            <Link
              to={`/register?next=/join/${code}`}
              className="btn btn-primary btn-block"
            >
              Create an account to join
            </Link>
            <Link
              to={`/login?next=/join/${code}`}
              className="btn btn-secondary btn-block"
            >
              I already have a wallet
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
