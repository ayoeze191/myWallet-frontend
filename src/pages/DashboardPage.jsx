import { useEffect, useState, useCallback } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { LedgerTable } from "../components/LedgerTable";
import {
  WalletIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  RefreshCwIcon,
  CreditCardIcon,
  UsersIcon,
  TrendingUpIcon,
  MenuIcon,
} from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [fundAmount, setFundAmount] = useState("");
  const [funding, setFunding] = useState(false);

  const [toEmail, setToEmail] = useState("");
  const [recipientName, setRecipientName] = useState(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [lookupError, setLookupError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, l] = await Promise.all([api.getMyWallet(), api.getMyLedger()]);
      setWallet(w);
      setEntries(l);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFund(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFunding(true);
    try {
      const result = await api.fundWallet(Number(fundAmount), user.email);
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setSuccess("Funding request submitted.");
        setFundAmount("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFunding(false);
    }
  }

  async function handleEmailBlur() {
    setRecipientName(null);
    setLookupError(null);
    if (!toEmail) return;
    try {
      const result = await api.lookupUser(toEmail);
      setRecipientName(result.name);
    } catch (err) {
      setLookupError(err.message);
    }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setTransferring(true);
    try {
      await api.transfer(toEmail, Number(transferAmount));
      setSuccess("Transfer complete.");
      setTransferAmount("");
      setToEmail("");
      setRecipientName(null);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTransferring(false);
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: wallet?.currency || "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalTransfers = entries.filter((e) => e.type === "transfer").length;
  const totalFunds = entries.filter((e) => e.type === "fund").length;

  if (loading && !wallet) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading your wallet…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="dashboard-main">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
            <h1 className="page-title">Dashboard</h1>
          </div>
          <div className="header-right">
            <button className="refresh-btn" onClick={load}>
              <RefreshCwIcon size={18} />
            </button>
          </div>
        </header>

        {/* Alerts */}
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Stats Cards */}
        {wallet && (
          <div className="stats-grid">
            <div className="stat-card stat-card-primary">
              <div className="stat-header">
                <span className="stat-label">Total Balance</span>
                <WalletIcon size={24} className="stat-icon" />
              </div>
              <div className="stat-value">{formatCurrency(wallet.balance)}</div>
              <div className="stat-sub">{wallet.owner_name}'s Wallet</div>
            </div>

            <div className="stat-card stat-card-success">
              <div className="stat-header">
                <span className="stat-label">Total Funds</span>
                <TrendingUpIcon size={24} className="stat-icon" />
              </div>
              <div className="stat-value">{totalFunds}</div>
              <div className="stat-sub">Funding transactions</div>
            </div>

            <div className="stat-card stat-card-info">
              <div className="stat-header">
                <span className="stat-label">Transfers</span>
                <UsersIcon size={24} className="stat-icon" />
              </div>
              <div className="stat-value">{totalTransfers}</div>
              <div className="stat-sub">Sent transactions</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === "overview" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab-btn ${activeTab === "fund" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("fund")}
          >
            Fund Wallet
          </button>
          <button
            className={`tab-btn ${activeTab === "transfer" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("transfer")}
          >
            Send Money
          </button>
          <button
            className={`tab-btn ${activeTab === "history" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>

        {/* Content */}
        <div className="dashboard-content">
          {activeTab === "overview" && (
            <div className="card">
              <h2 className="card-title">Recent Activity</h2>
              <LedgerTable entries={entries.slice(0, 5)} />
              {entries.length > 5 && (
                <button
                  className="view-more-btn"
                  onClick={() => setActiveTab("history")}
                >
                  View All Transactions →
                </button>
              )}
            </div>
          )}

          {activeTab === "fund" && (
            <div className="card card-fund">
              <h2 className="card-title">Fund Your Wallet</h2>
              <form onSubmit={handleFund} className="fund-form">
                <div className="form-group">
                  <label htmlFor="fundAmount" className="form-label">
                    Amount to Fund
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">
                      {wallet?.currency || "₦"}
                    </span>
                    <input
                      id="fundAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={funding}
                >
                  {funding ? (
                    <>
                      <span className="spinner"></span>
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCardIcon size={18} />
                      Fund with Paystack
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "transfer" && (
            <div className="card card-transfer">
              <h2 className="card-title">Send Money</h2>
              <form onSubmit={handleTransfer} className="transfer-form">
                <div className="form-group">
                  <label htmlFor="toEmail" className="form-label">
                    Recipient Email
                  </label>
                  <input
                    id="toEmail"
                    type="email"
                    className="form-input"
                    placeholder="recipient@example.com"
                    value={toEmail}
                    onChange={(e) => setToEmail(e.target.value)}
                    onBlur={handleEmailBlur}
                    required
                  />
                  {recipientName && (
                    <div className="form-hint success">
                      ✓ Sending to {recipientName}
                    </div>
                  )}
                  {lookupError && (
                    <div className="form-hint error">✗ {lookupError}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="transferAmount" className="form-label">
                    Amount
                  </label>
                  <div className="input-wrapper">
                    <span className="input-prefix">
                      {wallet?.currency || "₦"}
                    </span>
                    <input
                      id="transferAmount"
                      type="number"
                      min="1"
                      step="0.01"
                      className="form-input"
                      placeholder="0.00"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-block"
                  type="submit"
                  disabled={transferring}
                >
                  {transferring ? (
                    <>
                      <span className="spinner"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <ArrowDownIcon size={18} />
                      Send Money
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeTab === "history" && (
            <div className="card">
              <h2 className="card-title">Transaction History</h2>
              <LedgerTable entries={entries} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
