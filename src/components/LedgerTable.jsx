function formatMoney(amount) {
  return Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-NG', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function LedgerTable({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="ledger">
        <div className="empty-state">No entries yet. Fund this wallet or receive a transfer to see activity here.</div>
      </div>
    );
  }

  return (
    <div className="ledger">
      <div className="ledger-header">
        <span>Date</span>
        <span>Type</span>
        <span>Balance after</span>
        <span style={{ textAlign: 'right' }}>Amount</span>
      </div>
      {entries.map((entry) => (
        <div className="ledger-row" key={entry.id}>
          <span>{formatDate(entry.created_at)}</span>
          <span>
            <span className={`stamp ${entry.direction}`}>{entry.direction}</span>
          </span>
          <span>{formatMoney(entry.balance_after)}</span>
          <span className={`amount ${entry.direction}`}>
            {entry.direction === 'credit' ? '+' : '-'}
            {formatMoney(entry.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

export { formatMoney };
