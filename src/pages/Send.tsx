import { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { FEE_TIERS } from "../lib/demo";
import { buildDraftTx, type DraftOutput } from "../lib/psbt";
import { formatBtc } from "../lib/crypto";
import { Badge } from "../components/Badge";

export function Send() {
  const { state } = useWallet();
  const [selected, setSelected] = useState<string[]>([]);
  const [outputs, setOutputs] = useState<DraftOutput[]>([{ address: "", valueSats: 10000 }]);
  const [tier, setTier] = useState("standard");
  const [customFee, setCustomFee] = useState(8);
  const [rbf, setRbf] = useState(true);

  const utxos = state?.utxos.filter((u) => !u.frozen) ?? [];
  const feeRate = tier === "custom" ? customFee : FEE_TIERS.find((t) => t.id === tier)?.satVb ?? 8;
  const inputs = utxos.filter((u) => selected.includes(u.id));

  const draft = useMemo(() => {
    if (!inputs.length || !outputs.some((o) => o.valueSats > 0)) return null;
    return buildDraftTx(inputs, outputs.filter((o) => o.valueSats > 0), feeRate, rbf, state?.settings.networkMode ?? "demo");
  }, [inputs, outputs, feeRate, rbf, state?.settings.networkMode]);

  function toggle(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Send</h1>
        <p className="text-sm text-aureus-muted">Coin control · fee tiers · RBF · batch outputs. Demo drafts PSBTs only.</p>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Coin control</h2>
        <div className="mt-3 space-y-2">
          {utxos.map((u) => (
            <label key={u.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-aureus-border bg-aureus-darker px-3 py-2">
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
              <div className="flex-1">
                <div className="text-sm">{formatBtc(u.valueSats)} · {u.label || "unlabeled"}</div>
                <div className="font-mono text-[10px] text-aureus-muted">{u.txid.slice(0, 16)}…:{u.vout}</div>
              </div>
              {u.vaultId && <Badge tone="muted">vault</Badge>}
            </label>
          ))}
        </div>
      </div>

      <div className="card space-y-4 p-6">
        <h2 className="font-semibold">Outputs (batch)</h2>
        {outputs.map((o, i) => (
          <div key={i} className="grid gap-2 md:grid-cols-[1fr_160px_auto]">
            <input className="input" placeholder="Address" value={o.address} onChange={(e) => setOutputs((arr) => arr.map((x, j) => (j === i ? { ...x, address: e.target.value } : x)))} />
            <input className="input" type="number" placeholder="sats" value={o.valueSats} onChange={(e) => setOutputs((arr) => arr.map((x, j) => (j === i ? { ...x, valueSats: Number(e.target.value) } : x)))} />
            <button className="btn-ghost" onClick={() => setOutputs((arr) => arr.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="btn-ghost" onClick={() => setOutputs((arr) => [...arr, { address: "", valueSats: 5000 }])}>Add output</button>
      </div>

      <div className="card grid gap-4 p-6 md:grid-cols-2">
        <div>
          <label className="label">Fee tier</label>
          <div className="flex flex-wrap gap-2">
            {FEE_TIERS.map((t) => (
              <button key={t.id} className={tier === t.id ? "btn-gold" : "btn-ghost"} onClick={() => setTier(t.id)}>
                {t.label} ({t.satVb} sat/vB)
              </button>
            ))}
            <button className={tier === "custom" ? "btn-gold" : "btn-ghost"} onClick={() => setTier("custom")}>Custom</button>
          </div>
          {tier === "custom" && (
            <input className="input mt-2" type="number" value={customFee} onChange={(e) => setCustomFee(Number(e.target.value))} />
          )}
        </div>
        <div>
          <label className="label">RBF</label>
          <button className={rbf ? "btn-gold" : "btn-ghost"} onClick={() => setRbf((v) => !v)}>
            RBF {rbf ? "enabled" : "disabled"}
          </button>
        </div>
      </div>

      {draft?.mergeAvoidanceWarning && (
        <div className="rounded-xl border border-aureus-warn/40 bg-aureus-warn/10 px-4 py-3 text-sm text-aureus-warn">
          Merge-avoidance alert: you selected {draft.inputs.length} inputs into a single payment. This links coins on-chain. Consider fewer inputs or separate sends — Aureus does not offer mixing.
        </div>
      )}

      {draft && (
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold">Draft PSBT</h2>
          <div className="text-sm text-aureus-soft">
            ~{draft.estimatedVbytes} vB · fee {formatBtc(draft.feeSats)} · {feeRate} sat/vB
          </div>
          <textarea className="input min-h-[120px] font-mono text-[11px]" readOnly value={draft.psbtBase64} />
          <p className="text-xs text-aureus-muted">Demo mode builds an illustrative PSBT. Broadcast is disabled until you connect a live backend on testnet/mainnet.</p>
        </div>
      )}
    </div>
  );
}
