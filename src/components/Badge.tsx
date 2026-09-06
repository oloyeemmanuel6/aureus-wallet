import clsx from "clsx";

export function Badge({ children, tone = "gold" }: { children: React.ReactNode; tone?: "gold" | "warn" | "danger" | "muted" }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        tone === "gold" && "bg-aureus-gold/15 text-aureus-gold",
        tone === "warn" && "bg-aureus-warn/15 text-aureus-warn",
        tone === "danger" && "bg-aureus-danger/15 text-aureus-danger",
        tone === "muted" && "bg-white/5 text-aureus-muted"
      )}
    >
      {children}
    </span>
  );
}
