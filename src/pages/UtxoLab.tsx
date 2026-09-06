import { useWallet } from "../context/WalletContext";
import { formatBtc } from "../lib/crypto";
import { Badge } from "../components/Badge";

export function UtxoLab() {
  const { state, setUtxoMeta, assignUtxoToVault } = useWallet();
  const utxos = state?.utxos ?? [];
  const vaults = state?.vaults ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">UTXO Lab</h1>
        <p className="text-sm text-aureus-muted">Labels · freeze · cost basis · vault assignment</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-aureus-darker text-xs uppercase tracking-wider text-aureus-muted">
            <tr>
              <th className="px-4 py-3">Value</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Cost basis</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Vault</th>
            </tr>
          </thead>
          <tbody>
            {utxos.map((u) => (
              <tr key={u.id} className="border-t border-aureus-border">
                <td className="px-4 py-3">
                  <div>{formatBtc(u.valueSats)}</div>
                  <div className="font-mono text-[10px] text-aureus-muted">{u.txid.slice(0, 12)}…</div>
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input"
                    value={u.label || ""}
                    onChange={(e) => setUtxoMeta(u.id, { label: e.target.value })}
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    className="input"
                    type="number"
                    value={u.costBasisUsd ?? 0}
                    onChange={(e) => setUtxoMeta(u.id, { costBasisUsd: Number(e.target.value) })}
                  />
                </td>
                <td className="px-4 py-3">
                  <button className={u.frozen ? "btn-gold" : "btn-ghost"} onClick={() => setUtxoMeta(u.id, { frozen: !u.frozen })}>
                    {u.frozen ? "Frozen" : "Freeze"}
                  </button>
                  <div className="mt-1"><Badge tone="muted">{u.confirmations} conf</Badge></div>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input"
                    value={u.vaultId || ""}
                    onChange={(e) => assignUtxoToVault(u.id, e.target.value || undefined)}
                  >
                    <option value="">None</option>
                    {vaults.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
