import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { formatBtc } from "../lib/crypto";
import { Badge } from "../components/Badge";

export function Vaults() {
  const { state, addVault, addMultisig, totalSats } = useWallet();
  const [name, setName] = useState("Cold inheritance");
  const [target, setTarget] = useState(0.5);
  const [date, setDate] = useState("2030-01-01");
  const [cosigners, setCosigners] = useState("xpubChild1\nxpubChild2\nxpubChild3");

  function exportChecklist() {
    const lines = [
      "# Aureus Inheritance Checklist",
      "",
      "- [ ] Seed phrase sealed (metal preferred)",
      "- [ ] PIN not stored with seed",
      "- [ ] Passphrase location documented separately",
      "- [ ] Multisig cosigner contacts verified",
      "- [ ] PSBT airgap device tested",
      "- [ ] Vault unlock dates reviewed",
      "- [ ] Attorney / executor briefed (no seed in will body)",
      "",
      "Vaults:",
      ...(state?.vaults.map((v) => `- ${v.name}: target ${v.targetBtc} BTC, unlock ${v.unlockDate}`) ?? []),
      "",
      "NOTICE: Aureus is an MVP and is not audited for production mainnet funds.",
      "NO coin mixing tools are included or recommended.",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aureus-inheritance-checklist.md";
    a.click();
  }

  async function onCreateVault() {
    await addVault({ name, targetBtc: target, unlockDate: date, notes: "Client-side policy only" });
  }

  async function onMultisig() {
    const keys = cosigners.split(/\n+/).map((s) => s.trim()).filter(Boolean);
    await addMultisig({
      name: "Family 2-of-3",
      m: 2,
      n: 3,
      cosigners: keys,
      scriptType: "wsh-p2wsh",
      psbtBase64: btoa(JSON.stringify({ m: 2, n: 3, cosigners: keys, demo: true })),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Bitcoin-backed Vaults</h1>
          <p className="text-sm text-aureus-muted">Named targets + unlock dates (client-side policy) · 2-of-3 multisig wizard · inheritance export</p>
        </div>
        <button className="btn-ghost" onClick={exportChecklist}>Export inheritance checklist</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold">Create vault</h2>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          <input className="input" type="number" step="0.01" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
          <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn-gold" onClick={onCreateVault}>Add vault</button>
          <p className="text-xs text-aureus-muted">Policy is enforced in-app by labeling/freezing UTXOs — not on-chain timelocks in this MVP.</p>
        </div>
        <div className="card space-y-3 p-6">
          <h2 className="font-semibold">2-of-3 multisig wizard</h2>
          <textarea className="input min-h-[120px] font-mono text-xs" value={cosigners} onChange={(e) => setCosigners(e.target.value)} />
          <button className="btn-gold" onClick={onMultisig}>Create draft + PSBT stub</button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {(state?.vaults ?? []).map((v) => {
          const bal = (state?.utxos ?? []).filter((u) => u.vaultId === v.id).reduce((a, u) => a + u.valueSats, 0);
          const unlocked = new Date(v.unlockDate) <= new Date();
          return (
            <div key={v.id} className="card p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{v.name}</h3>
                <Badge tone={unlocked ? "gold" : "muted"}>{unlocked ? "unlock reached" : "locked policy"}</Badge>
              </div>
              <div className="mt-3 text-sm text-aureus-soft">Target {v.targetBtc} BTC · unlock {v.unlockDate}</div>
              <div className="mt-1 text-aureus-gold">{formatBtc(bal)} assigned</div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-aureus-darker">
                <div className="h-full bg-aureus-gold" style={{ width: `${Math.min(100, (bal / 1e8 / v.targetBtc) * 100)}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Multisig drafts</h2>
        <div className="mt-3 space-y-3">
          {(state?.multisigs ?? []).map((m) => (
            <div key={m.id} className="rounded-xl border border-aureus-border bg-aureus-darker p-4">
              <div className="font-medium">{m.name} · {m.m}-of-{m.n}</div>
              <textarea className="input mt-2 min-h-[80px] font-mono text-[11px]" readOnly value={m.psbtBase64 || ""} />
            </div>
          ))}
          {!state?.multisigs.length && <p className="text-sm text-aureus-muted">No multisig drafts yet. Wallet spendable {formatBtc(totalSats)}.</p>}
        </div>
      </div>
    </div>
  );
}
