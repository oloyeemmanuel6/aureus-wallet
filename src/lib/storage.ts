import type { WalletState } from "./types";

const LOCAL_KEY = "aureus.wallet.v1";

async function readRaw(): Promise<string | null> {
  if (window.aureus?.storage) {
    return window.aureus.storage.read();
  }
  return localStorage.getItem(LOCAL_KEY);
}

async function writeRaw(data: string): Promise<void> {
  if (window.aureus?.storage) {
    await window.aureus.storage.write(data);
    return;
  }
  localStorage.setItem(LOCAL_KEY, data);
}

export async function loadWalletState(): Promise<WalletState | null> {
  const raw = await readRaw();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as WalletState;
  } catch {
    return null;
  }
}

export async function saveWalletState(state: WalletState): Promise<void> {
  await writeRaw(JSON.stringify(state));
}

export async function clearWalletState(): Promise<void> {
  if (window.aureus?.storage) {
    await window.aureus.storage.clear();
  }
  localStorage.removeItem(LOCAL_KEY);
}

export function defaultSettings() {
  return {
    esploraUrl: "https://mempool.space/testnet/api",
    electrumUrl: "ssl://electrum.blockstream.info:60002",
    torProxyUrl: "",
    autoLockMinutes: 5,
    discreetMode: false,
    networkMode: "demo" as const,
    mainnetUnlocked: false,
  };
}
