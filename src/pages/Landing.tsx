import { Link } from "react-router-dom";
import { Shield, KeyRound, Ban, Sparkles } from "lucide-react";

export function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-aureus-black px-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,168,75,0.14),transparent_50%)]" />
      <div className="relative z-10 max-w-3xl text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-aureus-gold to-aureus-gold-dim text-aureus-black shadow-gold">
          <Sparkles size={28} />
        </div>
        <h1 className="font-display text-5xl tracking-tight text-white md:text-6xl">
          Aureus
        </h1>
        <p className="mt-3 text-lg text-aureus-gold">Premium Bitcoin-only self-custody for macOS</p>
        <p className="mx-auto mt-5 max-w-xl text-aureus-soft">
          Keys stay on your machine. BIP84 SegWit by default, vault policies, coin control, and PSBT airgap tooling —
          with zero coin mixing. MVP · not audited for production mainnet funds.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/onboarding" className="btn-gold px-6 py-3">Create or restore wallet</Link>
          <Link to="/unlock" className="btn-ghost px-6 py-3">Unlock existing</Link>
        </div>
        <div className="mt-12 grid gap-4 text-left md:grid-cols-3">
          {[
            { icon: KeyRound, title: "Self-custody", body: "BIP39 + optional passphrase. PIN-encrypted local vault." },
            { icon: Ban, title: "No mixing", body: "No CoinJoin, Whirlpool, Wasabi, or JoinMarket — ever." },
            { icon: Shield, title: "Demo by default", body: "Testnet/demo first. Mainnet gated as advanced." },
          ].map((f) => (
            <div key={f.title} className="card p-5">
              <f.icon className="mb-3 text-aureus-gold" size={20} />
              <div className="font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-aureus-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
