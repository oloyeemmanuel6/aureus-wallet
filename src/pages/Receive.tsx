import { useState } from "react";
import { useWallet } from "../context/WalletContext";
import { QrPanel } from "../components/QrPanel";
import { Badge } from "../components/Badge";

export function Receive() {
  const { state, nextReceiveAddress, ensureAddresses } = useWallet();
  const [fresh, setFresh] = useState<string>("");
  const addresses = state?.addresses.filter((a) => a.type === "bip84") ?? [];
  const reused = addresses.filter((a) => a.used);

  async function onFresh() {
    const entry = await nextReceiveAddress();
    if (entry) setFresh(entry.address);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Receive</h1>
        <p className="text-sm text-aureus-muted">Fresh BIP84 addresses · no-reuse alerts · PayNym-style payment code (BIP47-inspired stub)</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="card p-6">
            <div className="flex gap-2">
              <button className="btn-gold" onClick={onFresh}>Fresh address</button>
              <button className="btn-ghost" onClick={() => ensureAddresses(5)}>Derive +5</button>
            </div>
            {fresh && (
              <div className="mt-4">
                <Badge>New</Badge>
                <code className="mt-2 block break-all font-mono text-sm text-aureus-gold">{fresh}</code>
              </div>
            )}
          </div>
          {reused.length > 0 && (
            <div className="rounded-xl border border-aureus-warn/40 bg-aureus-warn/10 px-4 py-3 text-sm text-aureus-warn">
              No-reuse alert: {reused.length} address(es) already marked used. Prefer a fresh address for each payment.
            </div>
          )}
          <div className="card p-6">
            <h2 className="font-semibold">Address book</h2>
            <div className="mt-3 max-h-80 space-y-2 overflow-auto">
              {addresses.map((a) => (
                <div key={a.address + a.index} className="rounded-lg bg-aureus-darker px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{a.address}</span>
                    {a.used ? <Badge tone="warn">used</Badge> : <Badge>fresh</Badge>}
                  </div>
                  <div className="text-[10px] text-aureus-muted">{a.path}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <QrPanel value={fresh || addresses[addresses.length - 1]?.address || ""} label="Address QR" />
          <div className="card p-6">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">PayNym-style payment code</h2>
              <Badge tone="muted">BIP47-inspired stub</Badge>
            </div>
            <p className="mt-2 text-sm text-aureus-muted">
              Networking / notification transactions are stubbed in this MVP. The code below is derived locally from your wallet fingerprint for UI and QR airgap demos — not a full BIP47 peer channel.
            </p>
            <code className="mt-3 block break-all rounded-xl bg-aureus-darker p-3 font-mono text-xs text-aureus-gold">
              {state?.paymentCode}
            </code>
            <div className="mt-4">
              <QrPanel value={state?.paymentCode || ""} label="Payment code QR" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
