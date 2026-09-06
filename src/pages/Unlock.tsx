import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWallet } from "../context/WalletContext";

export function Unlock() {
  const { state, unlock } = useWallet();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function onUnlock() {
    const ok = await unlock(pin);
    if (!ok) setError("Incorrect PIN or corrupted vault");
    else nav("/app");
  }

  if (!state?.hasWallet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-aureus-black">
        <div className="card p-8 text-center">
          <p className="text-aureus-soft">No wallet found.</p>
          <Link to="/onboarding" className="btn-gold mt-4 inline-flex">Create wallet</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-aureus-black px-6">
      <div className="card w-full max-w-md p-8">
        <h1 className="font-display text-3xl text-aureus-gold">Welcome back</h1>
        <p className="mt-2 text-sm text-aureus-muted">Fingerprint {state.fingerprint.slice(0, 8)}…</p>
        <label className="label mt-6">PIN</label>
        <input className="input" type="password" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onUnlock()} />
        {error && <p className="mt-2 text-sm text-aureus-danger">{error}</p>}
        <button className="btn-gold mt-6 w-full" onClick={onUnlock}>Unlock</button>
      </div>
    </div>
  );
}
