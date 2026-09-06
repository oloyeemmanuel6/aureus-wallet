import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import type { WordCount } from "../lib/crypto";

export function Onboarding() {
  const { createWallet, restoreWallet } = useWallet();
  const nav = useNavigate();
  const [tab, setTab] = useState<"create" | "restore">("create");
  const [words, setWords] = useState<WordCount>(12);
  const [pin, setPin] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    setError("");
    if (pin.length < 4) return setError("PIN must be at least 4 characters");
    setBusy(true);
    try {
      const m = await createWallet({ words, pin, passphrase });
      setRevealed(m);
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRestore() {
    setError("");
    if (pin.length < 4) return setError("PIN must be at least 4 characters");
    setBusy(true);
    try {
      await restoreWallet({ mnemonic, pin, passphrase });
      nav("/app");
    } catch (e: any) {
      setError(e.message || "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (revealed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aureus-black px-6">
        <div className="card max-w-xl p-8">
          <h2 className="font-display text-2xl text-aureus-gold">Write down your seed</h2>
          <p className="mt-2 text-sm text-aureus-muted">This is shown once. Aureus cannot recover it. Never share it.</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {revealed.split(" ").map((w, i) => (
              <div key={i} className="rounded-lg bg-aureus-darker px-3 py-2 text-sm">
                <span className="text-aureus-muted">{i + 1}.</span> {w}
              </div>
            ))}
          </div>
          <button className="btn-gold mt-8 w-full" onClick={() => nav("/app")}>I saved it — open wallet</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-aureus-black px-6">
      <div className="card w-full max-w-lg p-8">
        <h1 className="font-display text-3xl text-aureus-gold">Onboarding</h1>
        <div className="mt-6 flex gap-2">
          <button className={tab === "create" ? "btn-gold" : "btn-ghost"} onClick={() => setTab("create")}>Create</button>
          <button className={tab === "restore" ? "btn-gold" : "btn-ghost"} onClick={() => setTab("restore")}>Restore</button>
        </div>
        {tab === "create" && (
          <div className="mt-6 space-y-4">
            <div>
              <label className="label">Mnemonic length</label>
              <div className="flex gap-2">
                {[12, 24].map((n) => (
                  <button key={n} className={words === n ? "btn-gold" : "btn-ghost"} onClick={() => setWords(n as WordCount)}>{n} words</button>
                ))}
              </div>
            </div>
          </div>
        )}
        {tab === "restore" && (
          <div className="mt-6">
            <label className="label">BIP39 mnemonic</label>
            <textarea className="input min-h-[100px]" value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} placeholder="twelve or twenty-four words" />
          </div>
        )}
        <div className="mt-4">
          <label className="label">Optional passphrase (BIP39)</label>
          <input className="input" type="password" value={passphrase} onChange={(e) => setPassphrase(e.target.value)} placeholder="Advanced" />
        </div>
        <div className="mt-4">
          <label className="label">PIN unlock</label>
          <input className="input" type="password" value={pin} onChange={(e) => setPin(e.target.value)} placeholder="At least 4 characters" />
        </div>
        {error && <p className="mt-3 text-sm text-aureus-danger">{error}</p>}
        <button
          className="btn-gold mt-6 w-full"
          disabled={busy}
          onClick={tab === "create" ? onCreate : onRestore}
        >
          {busy ? "Working…" : tab === "create" ? "Generate wallet" : "Restore wallet"}
        </button>
      </div>
    </div>
  );
}
