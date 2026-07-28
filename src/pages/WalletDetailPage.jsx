import { useEffect, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { LedgerTable } from '../components/LedgerTable';

export default function WalletDetailPage() {
  const { id } = useParams();
  const [wallet, setWallet] = useState(null);
  const [entries, setEntries] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [fundAmount, setFundAmount] = useState('');
  const [fundEmail, setFundEmail] = useState('');
  const [funding, setFunding] = useState(false);

  const [transferTo, setTransferTo] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferring, setTransferring] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [w, l, all] = await Promise.all([
        api.getWallet(id),
        api.getLedger(id),
        api.listWallets(),
      ]);
      setWallet(w);
      setEntries(l);
      setWallets(all.filter((x) => x.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFund(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFunding(true);
    try {
      const result = await api.fundWallet(id, Number(fundAmount), fundEmail);
      if (result.authorization_url) {
        window.location.href = result.authorization_url;
      } else {
        setSuccess('Funding request submitted.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setFunding(false);
    }
  }

  async function handleTransfer(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!transferTo) {
      setError('Choose a wallet to send to.');
      return;
    }
    setTransferring(true);
    try {
      await api.transfer(id, transferTo, Number(transferAmount));
      setSuccess('Transfer complete.');
      setTransferAmount('');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setTransferring(false);
    }
  }

  if (loading && !wallet) {
    return <div className="empty-state">Loading wallet…</div>;
  }

  if (error && !wallet) {
    return <div className="error-banner">{error}</div>;
  }

  return (
    <>
      <Link className="back-link" to="/">← All wallets</Link>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="card">
        <div className="balance-label">{wallet.owner_name}'s balance</div>
        <div className="balance-figure">
          {wallet.currency} {Number(wallet.balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="form-row">
        <div className="card" style={{ flex: 1 }}>
          <h2>Fund wallet</h2>
          <form onSubmit={handleFund}>
            <div className="field">
              <label htmlFor="fundEmail">Email (for Paystack)</label>
              <input
                id="fundEmail"
                type="email"
                value={fundEmail}
                onChange={(e) => setFundEmail(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="fundAmount">Amount</label>
              <input
                id="fundAmount"
                type="number"
                min="1"
                step="0.01"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
                required
              />
            </div>
            <button className="btn" type="submit" disabled={funding}>
              {funding ? 'Starting…' : 'Fund with Paystack'}
            </button>
          </form>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <h2>Send money</h2>
          <form onSubmit={handleTransfer}>
            <div className="field">
              <label htmlFor="transferTo">Send to</label>
              <select id="transferTo" value={transferTo} onChange={(e) => setTransferTo(e.target.value)} required>
                <option value="">Select a wallet…</option>
                {wallets.map((w) => (
                  <option value={w.id} key={w.id}>
                    {w.owner_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="transferAmount">Amount</label>
              <input
                id="transferAmount"
                type="number"
                min="1"
                step="0.01"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                required
              />
            </div>
            <button className="btn secondary" type="submit" disabled={transferring}>
              {transferring ? 'Sending…' : 'Send'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <h2>Ledger</h2>
        <LedgerTable entries={entries} />
      </div>
    </>
  );
}
