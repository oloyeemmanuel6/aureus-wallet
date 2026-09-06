import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { QrPanel } from "../components/QrPanel";
import { Badge } from "../components/Badge";

export function PsbtLab() {
  const { getXpub, addWatchOnly, state } = useWallet();
  const [psbtIn, setPsbtIn] = useState("");
  const [watchName, setWatchName] = useState("Watch desk");
  const [watchXpub, setWatchXpub] = useState("");
  const xpub = getXpub();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">PSBT Lab</h1>
        <p className="text-sm text-aureus-muted">PSBT import/export · watch-only xpub/zpub · QR airgap panels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold">Account xpub (BIP84)</h2>
          <code className="block break-all rounded-xl bg-aureus-darker p-3 font-mono text-[11px] text-aureus-gold">{xpub || "Unlock wallet to derive xpub"}</code>
          {xpub && <QrPanel value={xpub} label="xpub airgap QR" />}
        </div>
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold">PSBT import</h2>
          <textarea className="input min-h-[140px] font-mono text-[11px]" value={psbtIn} onChange={(e) => setPsbtIn(e.target.value)} placeholder="Paste PSBT base64" />
          <div className="text-sm text-aureus-soft">
            {psbtIn ? `Loaded ${psbtIn.length} chars · demo parse only (no broadcast)` : "Waiting for PSBT"}
          </div>
          {psbtIn && <QrPanel value={psbtIn.slice(0, 800)} label="PSBT QR chunk (airgap)" />}
        </div>
      </div>

      <div className="card space-y-3 p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Watch-only</h2>
          <Badge tone="muted">xpub / zpub</Badge>
        </div>
        <input className="input" value={watchName} onChange={(e) => setWatchName(e.target.value)} placeholder="Label" />
        <input className="input font-mono text-xs" value={watchXpub} onChange={(e) => setWatchXpub(e.target.value)} placeholder="xpub… or zpub…" />
        <button
          className="btn-gold"
          onClick={() => addWatchOnly({ name: watchName, xpub: watchXpub, derivation: "m/84'/1'/0'" })}
          disabled={!watchXpub}
        >
          Add watch-only account
        </button>
        <div className="mt-4 space-y-2">
          {(state?.watchOnly ?? []).map((w) => (
            <div key={w.id} className="rounded-xl bg-aureus-darker px-3 py-2">
              <div className="font-medium">{w.name}</div>
              <div className="font-mono text-[11px] text-aureus-muted">{w.xpub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
