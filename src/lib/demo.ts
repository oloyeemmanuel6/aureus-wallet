import { v4 as uuid } from "uuid";
import type { UTXO, AddressEntry } from "./types";

export const DEMO_PRICE_HISTORY = [
  { date: "2024-01", price: 42000 },
  { date: "2024-02", price: 51000 },
  { date: "2024-03", price: 70000 },
  { date: "2024-04", price: 64000 },
  { date: "2024-05", price: 68000 },
  { date: "2024-06", price: 62000 },
  { date: "2024-07", price: 66000 },
  { date: "2024-08", price: 59000 },
  { date: "2024-09", price: 63000 },
  { date: "2024-10", price: 72000 },
  { date: "2024-11", price: 92000 },
  { date: "2024-12", price: 98000 },
  { date: "2025-01", price: 105000 },
  { date: "2025-02", price: 98000 },
  { date: "2025-03", price: 87000 },
  { date: "2025-06", price: 108000 },
  { date: "2025-09", price: 112000 },
  { date: "2026-01", price: 125000 },
  { date: "2026-04", price: 131000 },
  { date: "2026-09", price: 138500 },
];

export function demoPriceUsd(): number {
  return DEMO_PRICE_HISTORY[DEMO_PRICE_HISTORY.length - 1].price;
}

export function buildDemoUtxos(addresses: AddressEntry[]): UTXO[] {
  const recv = addresses.filter((a) => a.type === "bip84").slice(0, 5);
  const samples = [
    { sats: 1_500_000, label: "Salary stack", cost: 92000, conf: 120 },
    { sats: 750_000, label: "Cold refill", cost: 101000, conf: 45 },
    { sats: 250_000, label: "Gift", cost: 88000, conf: 12 },
    { sats: 100_000, label: "Dust consolidatable", cost: 110000, conf: 3 },
    { sats: 50_000, label: "Change", cost: 138000, conf: 1 },
  ];
  return samples.map((s, i) => ({
    id: uuid(),
    txid: (i + 1).toString(16).padStart(64, "a"),
    vout: i,
    address: recv[i % Math.max(recv.length, 1)]?.address ?? "tb1qdemo",
    valueSats: s.sats,
    label: s.label,
    frozen: false,
    costBasisUsd: s.cost,
    confirmations: s.conf,
  }));
}

export const FEE_TIERS = [
  { id: "economy", label: "Economy", satVb: 2, eta: "~6 blocks" },
  { id: "standard", label: "Standard", satVb: 8, eta: "~2 blocks" },
  { id: "priority", label: "Priority", satVb: 25, eta: "next block" },
] as const;
