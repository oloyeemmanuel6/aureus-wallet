import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { Badge } from "../components/Badge";

export function Settings() {
  const { state, updateSettings, exportBackup, wipe, refreshDemoUtxos } = useWallet();
  const s = state?.settings;
  const [msg, setMsg] = useState("");

  if (!s) return null;

  async function onExport() {
    const data = await exportBackup();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aureus-backup.json";
    a.click();
    setMsg("Encrypted backup downloaded");
  }

  async function unlockMainnet() {
    const ok = window.confirm(
      "MAINNET ADVANCED: Aureus is an MVP and NOT audited. Only continue if you understand the risk of loss. Enable mainnet?"
    );
    if (ok) await updateSettings({ mainnetUnlocked: true, networkMode: "mainnet" });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="text-sm text-aureus-muted">Network endpoints · Tor · auto-lock · backups</p>
      </div>

      <div className="card space-y-4 p-6">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">Network mode</h2>
          <Badge>{s.networkMode}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["demo", "testnet"] as const).map((m) => (
            <button key={m} className={s.networkMode === m ? "btn-gold" : "btn-ghost"} onClick={() => updateSettings({ networkMode: m })}>
              {m}
            </button>
          ))}
          <button className={s.networkMode === "mainnet" ? "btn-gold" : "btn-ghost"} onClick={unlockMainnet}>
            mainnet (advanced)
          </button>
        </div>
        <p className="text-xs text-aureus-warn">MVP — not audited for production mainnet funds. Prefer demo/testnet.</p>
      </div>

      <div className="card grid gap-4 p-6 md:grid-cols-2">
        <div>
          <label className="label">Esplora endpoint</label>
          <input className="input" value={s.esploraUrl} onChange={(e) => updateSettings({ esploraUrl: e.target.value })} />
        </div>
        <div>
          <label className="label">Electrum endpoint</label>
          <input className="input" value={s.electrumUrl} onChange={(e) => updateSettings({ electrumUrl: e.target.value })} />
        </div>
        <div>
          <label className="label">Tor proxy URL</label>
          <input className="input" value={s.torProxyUrl} onChange={(e) => updateSettings({ torProxyUrl: e.target.value })} placeholder="socks5://127.0.0.1:9050" />
        </div>
        <div>
          <label className="label">Auto-lock (minutes)</label>
          <input className="input" type="number" value={s.autoLockMinutes} onChange={(e) => updateSettings({ autoLockMinutes: Number(e.target.value) })} />
        </div>
      </div>

      <div className="card flex flex-wrap gap-3 p-6">
        <button className="btn-gold" onClick={onExport}>Export encrypted backup</button>
        <button className="btn-ghost" onClick={() => refreshDemoUtxos()}>Refresh demo UTXOs</button>
        <button
          className="btn-ghost text-aureus-danger"
          onClick={async () => {
            if (window.confirm("Wipe local wallet data?")) await wipe();
          }}
        >
          Wipe wallet
        </button>
      </div>

      <div className="rounded-xl border border-aureus-border bg-aureus-card/50 p-4 text-sm text-aureus-soft">
        <strong className="text-aureus-gold">No coin mixing.</strong> Aureus will never implement CoinJoin, Whirlpool, Wasabi, JoinMarket, or any mixer.
        {msg && <div className="mt-2 text-aureus-success">{msg}</div>}
      </div>
    </div>
  );
}
