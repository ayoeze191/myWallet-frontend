import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Sidebar from "../components/Sidebar";
import { formatMoney } from "../components/LedgerTable";
import { formatDay, FREQUENCY_LABEL } from "../lib/format";
import {
  MenuIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  RefreshCwIcon,
} from "lucide-react";

function tomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

const EMPTY_FORM = {
  name: "",
  description: "",
  contributionAmount: "",
  frequency: "monthly",
  memberLimit: 5,
  startDate: tomorrow(),
};

export default function ContributionsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setContributions(await api.listContributions());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  async function handleCreate(e) {
    e.preventDefault();
    setError(null);
    setCreating(true);
    try {
      const created = await api.createContribution({
        ...form,
        contributionAmount: Number(form.contributionAmount),
        memberLimit: Number(form.memberLimit),
      });
      setForm({ ...EMPTY_FORM, startDate: tomorrow() });
      setShowForm(false);
      await load();
      copyLink(created.invite_link, created.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  function copyLink(link, id) {
    navigator.clipboard?.writeText(link).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      },
      () => setError("Could not copy the link — you can still open the Ajo to see it."),
    );
  }

  const potPerRound = (c) =>
    Number(c.contribution_amount) *
    Number(c.status === "open" ? c.member_limit : c.member_count);

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-button" onClick={() => setSidebarOpen(true)}>
              <MenuIcon size={24} />
            </button>
            <h1 className="page-title">My Ajo</h1>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={load}>
              <RefreshCwIcon size={18} />
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setShowForm((s) => !s)}
            >
              <PlusIcon size={18} />
              {showForm ? "Close" : "Start an Ajo"}
            </button>
          </div>
        </header>

        {error && <div className="alert alert-error">{error}</div>}

        {showForm && (
          <div className="card">
            <h2 className="card-title">Start a contribution</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className="form-input"
                  placeholder="Lagos Traders Ajo"
                  value={form.name}
                  onChange={update("name")}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="description">
                  Description <span className="form-optional">(optional)</span>
                </label>
                <input
                  id="description"
                  className="form-input"
                  placeholder="What is this Ajo for?"
                  value={form.description}
                  onChange={update("description")}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="amount">
                    Each member pays
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">₦</span>
                    <input
                      id="amount"
                      className="form-input"
                      type="number"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={form.contributionAmount}
                      onChange={update("contributionAmount")}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="frequency">
                    How often
                  </label>
                  <select
                    id="frequency"
                    className="form-input"
                    value={form.frequency}
                    onChange={update("frequency")}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="memberLimit">
                    Number of members
                  </label>
                  <input
                    id="memberLimit"
                    className="form-input"
                    type="number"
                    min="2"
                    max="50"
                    value={form.memberLimit}
                    onChange={update("memberLimit")}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="startDate">
                    Start date
                  </label>
                  <input
                    id="startDate"
                    className="form-input"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={form.startDate}
                    onChange={update("startDate")}
                    required
                  />
                </div>
              </div>

              {form.contributionAmount > 0 && (
                <p className="form-hint">
                  Each member collects{" "}
                  <strong>
                    ₦
                    {formatMoney(
                      Number(form.contributionAmount) * Number(form.memberLimit || 0),
                    )}
                  </strong>{" "}
                  once, over {form.memberLimit} rounds. Members can join by link
                  until {formatDay(form.startDate)}.
                </p>
              )}

              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={creating}
              >
                {creating ? "Creating…" : "Create and get invite link"}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="card">
            <div className="empty-state">Loading your contributions…</div>
          </div>
        ) : contributions.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              You are not in any Ajo yet. Start one above, or open an invite link
              a friend sent you.
            </div>
          </div>
        ) : (
          <div className="ajo-grid">
            {contributions.map((c) => (
              <div className="card ajo-card" key={c.id}>
                <div className="ajo-card-head">
                  <div>
                    <Link to={`/contributions/${c.id}`} className="ajo-card-name">
                      {c.name}
                    </Link>
                    <p className="ajo-card-sub">
                      {FREQUENCY_LABEL[c.frequency]} · ₦
                      {formatMoney(c.contribution_amount)} each
                    </p>
                  </div>
                  <span className={`ajo-badge ajo-badge-${c.status}`}>
                    {c.status}
                  </span>
                </div>

                <dl className="ajo-facts">
                  <div>
                    <dt>Members</dt>
                    <dd>
                      {c.member_count} / {c.member_limit}
                    </dd>
                  </div>
                  <div>
                    <dt>{c.status === "open" ? "Pot when full" : "Pot per round"}</dt>
                    <dd>₦{formatMoney(potPerRound(c))}</dd>
                  </div>
                  <div>
                    <dt>{c.status === "open" ? "Starts" : "Rounds paid"}</dt>
                    <dd>
                      {c.status === "open"
                        ? formatDay(c.start_date)
                        : `${c.rounds_paid} / ${c.total_rounds ?? c.member_count}`}
                    </dd>
                  </div>
                </dl>

                <div className="ajo-card-actions">
                  <Link to={`/contributions/${c.id}`} className="btn btn-secondary">
                    Open
                  </Link>
                  {c.status === "open" && (
                    <button
                      className="btn btn-ghost"
                      onClick={() => copyLink(c.invite_link, c.id)}
                    >
                      {copied === c.id ? (
                        <>
                          <CheckIcon size={16} /> Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon size={16} /> Copy invite
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
