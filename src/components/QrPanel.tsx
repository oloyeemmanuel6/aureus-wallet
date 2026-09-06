import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrPanel({ value, label }: { value: string; label?: string }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, { margin: 1, width: 220, color: { dark: "#0a0a0b", light: "#e8c872" } }).then(setUrl);
  }, [value]);
  return (
    <div className="card flex flex-col items-center gap-3 p-4">
      {label && <div className="text-xs uppercase tracking-wider text-aureus-muted">{label}</div>}
      {url ? <img src={url} alt="QR" className="rounded-xl" /> : <div className="h-[220px] w-[220px] animate-pulse rounded-xl bg-aureus-dark" />}
      <code className="max-w-full break-all text-center text-[11px] text-aureus-soft">{value}</code>
    </div>
  );
}
