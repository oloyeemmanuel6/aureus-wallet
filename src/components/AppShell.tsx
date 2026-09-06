import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownLeft,
  Boxes,
  Vault,
  FileKey2,
  Settings,
  EyeOff,
  Lock,
  Sparkles,
} from "lucide-react";
import { useWallet } from "../context/WalletContext";
import clsx from "clsx";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/send", label: "Send", icon: ArrowUpRight },
  { to: "/app/receive", label: "Receive", icon: ArrowDownLeft },
  { to: "/app/utxos", label: "UTXO Lab", icon: Boxes },
  { to: "/app/vaults", label: "Vaults", icon: Vault },
  { to: "/app/psbt", label: "PSBT Lab", icon: FileKey2 },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { state, lock, updateSettings, totalSats } = useWallet();
  const discreet = state?.settings.discreetMode;

  return (
    <div className="flex h-full min-h-screen bg-aureus-black text-white">
      <aside className="flex w-60 flex-col border-r border-aureus-border bg-aureus-darker/90 pt-10">
        <div className="px-5 pb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-aureus-gold to-aureus-gold-dim text-aureus-black shadow-gold">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="font-display text-lg tracking-wide text-aureus-gold">Aureus</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-aureus-muted">Bitcoin only</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  isActive ? "bg-aureus-gold/15 text-aureus-gold" : "text-aureus-soft hover:bg-white/5 hover:text-white"
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-aureus-border p-4">
          <div className="rounded-xl bg-aureus-card px-3 py-2 text-xs text-aureus-muted">
            Mode: <span className="text-aureus-gold">{state?.settings.networkMode}</span>
            <div className="mt-1">Spendable: {discreet ? "••••" : (totalSats / 1e8).toFixed(8)} BTC</div>
          </div>
          <button className="btn-ghost w-full" onClick={() => updateSettings({ discreetMode: !discreet })}>
            <EyeOff size={14} /> Discreet
          </button>
          <button className="btn-ghost w-full" onClick={lock}>
            <Lock size={14} /> Lock
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto bg-[radial-gradient(ellipse_at_top,rgba(212,168,75,0.08),transparent_55%)]">
        <div className="drag-region h-10 w-full" />
        <div className="mx-auto max-w-6xl px-8 pb-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
