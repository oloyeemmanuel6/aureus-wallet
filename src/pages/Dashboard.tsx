import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useWallet } from "../context/WalletContext";
import { formatBtc, formatUsd, satsToBtc } from "../lib/crypto";
import { DEMO_PRICE_HISTORY } from "../lib/demo";
import { Badge } from "../components/Badge";

export function Dashboard() {
  const { state, totalSats, priceUsd, getTaprootPreview } = useWallet();
  const discreet = state?.settings.discreetMode ?? false;
  const usd = satsToBtc(totalSats) * priceUsd;
  const tap = getTaprootPreview();
  const recv = state?.addresses.filter((a) => a.type === "bip84").slice(0, 3) ?? [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-white">Dashboard</h1>
          <p className="text-sm text-aureus-muted">Bitcoin purchasing power · self-custody</p>
        </div>
        <Badge>{state?.settings.networkMode} mode</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card p-6 md:col-span-2">
          <div className="text-xs uppercase tracking-wider text-aureus-muted">Balance</div>
          <div className="mt-2 font-display text-4xl text-aureus-gold">{formatBtc(totalSats, discreet)}</div>
          <div className="mt-1 text-lg text-aureus-soft">{formatUsd(usd, discreet)}</div>
          <div className="mt-2 text-xs text-aureus-muted">Spot ≈ {formatUsd(priceUsd)} / BTC</div>
        </div>
        <div className="card p-6">
          <div className="text-xs uppercase tracking-wider text-aureus-muted">Security</div>
          <ul className="mt-3 space-y-2 text-sm text-aureus-soft">
            <li>No coin mixing — by design</li>
            <li>Keys encrypted at rest (PIN + AES-GCM)</li>
            <li>Auto-lock: {state?.settings.autoLockMinutes}m</li>
            <li>Fingerprint: {state?.fingerprint.slice(0, 12)}…</li>
          </ul>
        </div>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Purchasing power</h2>
          <span className="text-xs text-aureus-muted">Public price series (demo-augmented)</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={DEMO_PRICE_HISTORY}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d4a84b" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#d4a84b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6b6b76" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b6b76" tick={{ fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: "#1a1a1e", border: "1px solid #2a2a30" }} />
              <Area type="monotone" dataKey="price" stroke="#d4a84b" fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="font-semibold">BIP84 receive (bc1… / tb1…)</h3>
          <div className="mt-3 space-y-2">
            {recv.map((a) => (
              <div key={a.address} className="rounded-xl bg-aureus-darker px-3 py-2 font-mono text-xs text-aureus-soft">
                {a.address}
                <div className="text-[10px] text-aureus-muted">{a.path}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Taproot upgrade path</h3>
            <Badge tone="muted">BIP86 preview</Badge>
          </div>
          <p className="mt-2 text-sm text-aureus-muted">
            Aureus defaults to BIP84 SegWit. Taproot (BIP86) is shown as a ready upgrade path for future spends and quieter on-chain footprints — without any mixing protocols.
          </p>
          {tap && (
            <div className="mt-4 rounded-xl bg-aureus-darker px-3 py-2 font-mono text-xs text-aureus-gold">
              {tap.address}
              <div className="text-[10px] text-aureus-muted">{tap.path}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
