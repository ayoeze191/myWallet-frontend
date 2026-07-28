import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function WalletsPage() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ownerName, setOwnerName] = useState('');
  const [creating, setCreating] = useState(false);

  async function loadWallets() {
    try {
      setLoading(true);
      const data = await api.listWallets();
      setWallets(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWallets();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    if (!ownerName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createWallet(ownerName.trim(), 'NGN');
      setOwnerName('');
      await loadWallets();
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <div className="card">
        <h2>Open a wallet</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="ownerName">Owner name</label>
              <input
                id="ownerName"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Eazy"
                required
              />
            </div>
          </div>
          <button className="btn" type="submit" disabled={creating}>
            {creating ? 'Opening…' : 'Open wallet'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>All wallets</h2>
        {loading ? (
          <div className="empty-state">Loading…</div>
        ) : wallets.length === 0 ? (
          <div className="empty-state">No wallets yet — open the first one above.</div>
        ) : (
          wallets.map((w) => (
            <Link className="wallet-list-item" to={`/wallets/${w.id}`} key={w.id}>
              <span className="wallet-name">{w.owner_name}</span>
              <span className="wallet-meta">
                {w.currency} {Number(w.balance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </span>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
