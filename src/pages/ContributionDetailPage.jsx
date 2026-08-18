import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "../components/Sidebar";
import { formatMoney } from "../components/LedgerTable";
import { formatDay, FREQUENCY_LABEL } from "../lib/format";
import {
  MenuIcon,
  CopyIcon,
  CheckIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  RefreshCwIcon,
  ArrowLeftIcon,
} from "lucide-react";

const ROUND_LABEL = {
  pending: "Not due yet",
  collecting: "Collecting",
  paid: "Paid out",
};

export default function ContributionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  // Local working copy of the payout order, so the creator can shuffle
  // members around and only commit when they are happy with it.
  const [order, setOrder] = useState([]);
  const [orderDirty, setOrderDirty] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const detail = await api.getContribution(id);
      setData(detail);
      setOrder(detail.members);
      setOrderDirty(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function act(fn, successMessage) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await fn();
      if (successMessage) setNotice(successMessage);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function move(index, direction) {
    const next = [...order];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
    setOrderDirty(true);
  }

  function copyInvite() {
    navigator.clipboard?.writeText(data.contribution.invite_link).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => setError("Could not copy — select the link above and copy it manually."),
    );
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Loading contribution…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="dashboard-main">
          <div className="alert alert-error">{error || "Not found"}</div>
          <Link to="/contributions" className="btn btn-secondary">
            Back to my Ajo
          </Link>
        </main>
      </div>
    );
  }

  const { contribution, members, rounds, me } = data;
  const isOpen = contribution.status === "open";
  const isCreator = contribution.is_creator;
  // Still open? The pot grows as people join, so quote it at full strength.
  // Once active, membership is frozen and this is the real figure.
  const potPerRound =
    Number(contribution.contribution_amount) *
    (isOpen ? Number(contribution.member_limit) : members.length);
  const nextRound = rounds.find((r) => r.status !== "paid");

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-button" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>
            <div>
              <Link to="/contributions" className="back-link">
                <ArrowLeftIcon size={14} /> My Ajo
              </Link>
              <h1 className="page-title">{contribution.name}</h1>
            </div>
          </div>
          <div className="header-right">
            <span className={`ajo-badge ajo-badge-${contribution.status}`}>
              {contribution.status}
            </span>
            <button className="refresh-btn" onClick={load}>
              <RefreshCwIcon size={18} />
            </button>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        {contribution.description && (
          <p className="ajo-description">{contribution.description}</p>
        )}

        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-header">
              <span className="stat-label">You pay each round</span>
            </div>
            <div className="stat-value">
              ₦{formatMoney(contribution.contribution_amount)}
            </div>
            <div className="stat-sub">{FREQUENCY_LABEL[contribution.frequency]}</div>
          </div>

          <div className="stat-card stat-card-success">
            <div className="stat-header">
              <span className="stat-label">You collect</span>
            </div>
            <div className="stat-value">₦{formatMoney(potPerRound)}</div>
            <div className="stat-sub">
              {isOpen
                ? "If every seat is filled"
                : `In round ${me.payout_slot}`}
            </div>
          </div>

          <div className="stat-card stat-card-info">
            <div className="stat-header">
              <span className="stat-label">In the pot now</span>
            </div>
            <div className="stat-value">
              ₦{formatMoney(contribution.pot_balance)}
            </div>
            <div className="stat-sub">
              {members.length} of {contribution.member_limit} members
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="card ajo-invite">
            <h2 className="card-title">Invite people to join</h2>
            <p className="ajo-cta-text">
              Anyone with this link can join until it starts on{" "}
              <strong>{formatDay(contribution.start_date)}</strong>.
              {members.length < 2 &&
                " It needs at least 2 members to start — it will keep waiting until then."}
            </p>
            <div className="invite-row">
              <code className="invite-link">{contribution.invite_link}</code>
              <button className="btn btn-primary" onClick={copyInvite}>
                {copied ? (
                  <>
                    <CheckIcon size={16} /> Copied
                  </>
                ) : (
                  <>
                    <CopyIcon size={16} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="card-title">
            Payout order
            {isOpen && isCreator && (
              <span className="card-title-hint">
                — drag-free: use the arrows to set who collects first
              </span>
            )}
          </h2>

          <ol className="member-list">
            {order.map((m, i) => (
              <li className="member-row" key={m.id}>
                <span className="member-slot">{i + 1}</span>
                <div className="member-identity">
                  <span className="member-name">
                    {m.name}
                    {m.user_id === user?.id && <em> (you)</em>}
                    {m.is_creator && <span className="member-tag">creator</span>}
                  </span>
                  <span className="member-email">{m.email}</span>
                </div>
                {m.missed_rounds > 0 && (
                  <span className="member-missed">
                    missed {m.missed_rounds}
                  </span>
                )}
                {isOpen && isCreator && (
                  <span className="member-move">
                    <button
                      className="icon-btn"
                      onClick={() => move(i, -1)}
                      disabled={i === 0}
                      aria-label={`Move ${m.name} earlier`}
                    >
                      <ChevronUpIcon size={16} />
                    </button>
                    <button
                      className="icon-btn"
                      onClick={() => move(i, 1)}
                      disabled={i === order.length - 1}
                      aria-label={`Move ${m.name} later`}
                    >
                      <ChevronDownIcon size={16} />
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ol>

          {isOpen && isCreator && orderDirty && (
            <div className="ajo-card-actions">
              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={() =>
                  act(
                    () =>
                      api.setPayoutOrder(
                        contribution.id,
                        order.map((m, i) => ({ memberId: m.id, slot: i + 1 })),
                      ),
                    "Payout order saved.",
                  )
                }
              >
                Save order
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  setOrder(members);
                  setOrderDirty(false);
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {rounds.length > 0 && (
          <div className="card">
            <h2 className="card-title">Rounds</h2>
            <div className="round-list">
              {rounds.map((r) => (
                <div
                  className={`round-row round-${r.status}`}
                  key={r.id}
                  aria-current={r.id === nextRound?.id ? "step" : undefined}
                >
                  <span className="round-number">#{r.round_number}</span>
                  <div className="round-body">
                    <span className="round-recipient">
                      {r.recipient_user_id === user?.id
                        ? "You collect"
                        : `${r.recipient_name} collects`}{" "}
                      ₦{formatMoney(r.expected_total)}
                    </span>
                    <span className="round-meta">
                      Due {formatDay(r.due_date)} · {r.paid_count}/{r.member_count}{" "}
                      paid in
                      {r.my_status === "pending" && r.status === "collecting" && (
                        <strong className="round-warning">
                          {" "}
                          · your payment has not gone through
                        </strong>
                      )}
                    </span>
                  </div>
                  <span className={`ajo-badge ajo-badge-round-${r.status}`}>
                    {ROUND_LABEL[r.status]}
                  </span>
                </div>
              ))}
            </div>
            <p className="form-hint">
              Contributions are taken from your wallet automatically. Keep at
              least ₦{formatMoney(contribution.contribution_amount)} in it before
              each due date — a round only pays out once everyone has paid in.
            </p>
          </div>
        )}

        <div className="card">
          <h2 className="card-title">Actions</h2>
          <div className="ajo-card-actions">
            <button
              className="btn btn-secondary"
              disabled={busy}
              onClick={() =>
                act(
                  () => api.runContribution(contribution.id),
                  "Checked for anything due.",
                )
              }
            >
              <RefreshCwIcon size={16} />
              Check for due rounds now
            </button>

            {isOpen && isCreator && (
              <button
                className="btn btn-ghost btn-danger"
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Cancel "${contribution.name}"? This cannot be undone.`))
                    return;
                  act(async () => {
                    await api.cancelContribution(contribution.id);
                    navigate("/contributions");
                  });
                }}
              >
                Cancel this Ajo
              </button>
            )}

            {isOpen && !isCreator && (
              <button
                className="btn btn-ghost btn-danger"
                disabled={busy}
                onClick={() => {
                  if (!confirm(`Leave "${contribution.name}"?`)) return;
                  act(async () => {
                    await api.leaveContribution(contribution.id);
                    navigate("/contributions");
                  });
                }}
              >
                Leave this Ajo
              </button>
            )}
          </div>
          {!isOpen && (
            <p className="form-hint">
              Membership and payout order are locked once an Ajo starts — the
              schedule everyone agreed to depends on them.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
