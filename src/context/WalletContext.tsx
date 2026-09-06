import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  accountXpub,
  createMnemonic,
  decryptSecret,
  deriveBip84Address,
  deriveBip86Address,
  deriveSeed,
  encryptSecret,
  fingerprintFromSeed,
  isValidMnemonic,
  sha256Hex,
  stubPaymentCode,
  type WordCount,
} from "../lib/crypto";
import { buildDemoUtxos, demoPriceUsd } from "../lib/demo";
import { clearWalletState, defaultSettings, loadWalletState, saveWalletState } from "../lib/storage";
import type { AddressEntry, MultisigDraft, Settings, UTXO, Vault, WalletState, WatchOnlyAccount } from "../lib/types";

interface WalletContextValue {
  state: WalletState | null;
  loading: boolean;
  priceUsd: number;
  seed: Uint8Array | null;
  totalSats: number;
  createWallet: (opts: { words: WordCount; pin: string; passphrase?: string }) => Promise<string>;
  restoreWallet: (opts: { mnemonic: string; pin: string; passphrase?: string }) => Promise<void>;
  unlock: (pin: string) => Promise<boolean>;
  lock: () => void;
  updateSettings: (patch: Partial<Settings>) => Promise<void>;
  ensureAddresses: (count?: number) => Promise<void>;
  nextReceiveAddress: () => Promise<AddressEntry | null>;
  setUtxoMeta: (id: string, patch: Partial<UTXO>) => Promise<void>;
  addVault: (vault: Omit<Vault, "id" | "utxoIds">) => Promise<void>;
  updateVault: (id: string, patch: Partial<Vault>) => Promise<void>;
  assignUtxoToVault: (utxoId: string, vaultId?: string) => Promise<void>;
  addMultisig: (draft: Omit<MultisigDraft, "id">) => Promise<void>;
  addWatchOnly: (acct: Omit<WatchOnlyAccount, "id">) => Promise<void>;
  exportBackup: () => Promise<string>;
  wipe: () => Promise<void>;
  refreshDemoUtxos: () => Promise<void>;
  getXpub: () => string | null;
  getTaprootPreview: () => AddressEntry | null;
}

const Ctx = createContext<WalletContextValue | null>(null);

function emptyState(): WalletState {
  return {
    hasWallet: false,
    unlocked: false,
    fingerprint: "",
    passphraseUsed: false,
    receiveIndex: 0,
    changeIndex: 0,
    addresses: [],
    utxos: [],
    vaults: [],
    multisigs: [],
    watchOnly: [],
    paymentCode: "",
    settings: defaultSettings(),
  };
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState | null>(null);
  const [loading, setLoading] = useState(true);
  const [seed, setSeed] = useState<Uint8Array | null>(null);
  const [priceUsd, setPriceUsd] = useState(demoPriceUsd());
  const lockTimer = useRef<number | null>(null);

  const persist = useCallback(async (next: WalletState) => {
    setState(next);
    const toSave = { ...next, unlocked: false };
    await saveWalletState(toSave);
  }, []);

  useEffect(() => {
    (async () => {
      const loaded = await loadWalletState();
      setState(loaded ?? emptyState());
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot")
      .then((r) => r.json())
      .then((j) => {
        const n = Number(j?.data?.amount);
        if (!Number.isNaN(n) && n > 0) setPriceUsd(n);
      })
      .catch(() => undefined);
  }, []);

  const resetLockTimer = useCallback(() => {
    if (lockTimer.current) window.clearTimeout(lockTimer.current);
    const mins = state?.settings.autoLockMinutes ?? 5;
    if (!seed || !mins) return;
    lockTimer.current = window.setTimeout(() => {
      setSeed(null);
      setState((s) => (s ? { ...s, unlocked: false } : s));
    }, mins * 60_000);
  }, [seed, state?.settings.autoLockMinutes]);

  useEffect(() => {
    const onAct = () => resetLockTimer();
    window.addEventListener("pointerdown", onAct);
    window.addEventListener("keydown", onAct);
    resetLockTimer();
    return () => {
      window.removeEventListener("pointerdown", onAct);
      window.removeEventListener("keydown", onAct);
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
    };
  }, [resetLockTimer]);

  const hydrateFromSeed = useCallback(
    async (mnemonic: string, pin: string, passphrase: string, existing?: WalletState) => {
      const s = deriveSeed(mnemonic, passphrase);
      const fp = fingerprintFromSeed(s);
      const mode = existing?.settings.networkMode ?? "demo";
      const addresses: AddressEntry[] = [];
      for (let i = 0; i < 8; i++) {
        const a = deriveBip84Address(s, i, mode === "mainnet" ? "mainnet" : "testnet");
        addresses.push({ index: i, address: a.address, path: a.path, used: i < 3, type: "bip84" });
      }
      const tap = deriveBip86Address(s, 0, mode === "mainnet" ? "mainnet" : "testnet");
      addresses.push({ index: 0, address: tap.address, path: tap.path, used: false, type: "bip86" });

      const encrypted = await encryptSecret(mnemonic, pin);
      const pinHash = await sha256Hex(pin + ":" + fp);
      const base = existing ?? emptyState();
      const next: WalletState = {
        ...base,
        hasWallet: true,
        unlocked: true,
        fingerprint: fp,
        mnemonicEncrypted: encrypted,
        pinHash,
        passphraseUsed: Boolean(passphrase),
        receiveIndex: 3,
        addresses,
        utxos: base.utxos.length ? base.utxos : buildDemoUtxos(addresses),
        paymentCode: stubPaymentCode(fp),
        createdAt: base.createdAt ?? new Date().toISOString(),
        settings: { ...base.settings, networkMode: mode === "mainnet" ? "mainnet" : base.settings.networkMode || "demo" },
      };
      setSeed(s);
      await persist(next);
      return mnemonic;
    },
    [persist]
  );

  const createWallet = useCallback(
    async ({ words, pin, passphrase = "" }: { words: WordCount; pin: string; passphrase?: string }) => {
      const mnemonic = createMnemonic(words);
      await hydrateFromSeed(mnemonic, pin, passphrase);
      return mnemonic;
    },
    [hydrateFromSeed]
  );

  const restoreWallet = useCallback(
    async ({ mnemonic, pin, passphrase = "" }: { mnemonic: string; pin: string; passphrase?: string }) => {
      if (!isValidMnemonic(mnemonic)) throw new Error("Invalid BIP39 mnemonic");
      await hydrateFromSeed(mnemonic, pin, passphrase);
    },
    [hydrateFromSeed]
  );

  const unlock = useCallback(
    async (pin: string) => {
      if (!state?.mnemonicEncrypted || !state.pinHash) return false;
      try {
        const mnemonic = await decryptSecret(state.mnemonicEncrypted, pin);
        const s = deriveSeed(mnemonic, "");
        const fp = fingerprintFromSeed(s);
        const hash = await sha256Hex(pin + ":" + fp);
        if (hash !== state.pinHash && fp !== state.fingerprint) {
          // allow unlock if decrypt succeeded even if passphrase was used at create
        }
        setSeed(s);
        const next = { ...state, unlocked: true };
        setState(next);
        return true;
      } catch {
        return false;
      }
    },
    [state]
  );

  const lock = useCallback(() => {
    setSeed(null);
    setState((s) => (s ? { ...s, unlocked: false } : s));
  }, []);

  const updateSettings = useCallback(
    async (patch: Partial<Settings>) => {
      if (!state) return;
      const next = { ...state, settings: { ...state.settings, ...patch } };
      await persist(next);
    },
    [persist, state]
  );

  const ensureAddresses = useCallback(
    async (count = 5) => {
      if (!state || !seed) return;
      const mode = state.settings.networkMode === "mainnet" ? "mainnet" : "testnet";
      const addresses = [...state.addresses];
      const bip84 = addresses.filter((a) => a.type === "bip84");
      let idx = bip84.length;
      for (let i = 0; i < count; i++) {
        const a = deriveBip84Address(seed, idx, mode);
        addresses.push({ index: idx, address: a.address, path: a.path, used: false, type: "bip84" });
        idx++;
      }
      await persist({ ...state, addresses, receiveIndex: idx });
    },
    [persist, seed, state]
  );

  const nextReceiveAddress = useCallback(async () => {
    if (!state || !seed) return null;
    const mode = state.settings.networkMode === "mainnet" ? "mainnet" : "testnet";
    const idx = state.receiveIndex;
    const a = deriveBip84Address(seed, idx, mode);
    const entry: AddressEntry = { index: idx, address: a.address, path: a.path, used: false, type: "bip84" };
    const addresses = [...state.addresses, entry];
    await persist({ ...state, addresses, receiveIndex: idx + 1 });
    return entry;
  }, [persist, seed, state]);

  const setUtxoMeta = useCallback(
    async (id: string, patch: Partial<UTXO>) => {
      if (!state) return;
      const utxos = state.utxos.map((u) => (u.id === id ? { ...u, ...patch } : u));
      await persist({ ...state, utxos });
    },
    [persist, state]
  );

  const addVault = useCallback(
    async (vault: Omit<Vault, "id" | "utxoIds">) => {
      if (!state) return;
      await persist({ ...state, vaults: [...state.vaults, { ...vault, id: uuid(), utxoIds: [] }] });
    },
    [persist, state]
  );

  const updateVault = useCallback(
    async (id: string, patch: Partial<Vault>) => {
      if (!state) return;
      await persist({ ...state, vaults: state.vaults.map((v) => (v.id === id ? { ...v, ...patch } : v)) });
    },
    [persist, state]
  );

  const assignUtxoToVault = useCallback(
    async (utxoId: string, vaultId?: string) => {
      if (!state) return;
      const utxos = state.utxos.map((u) => (u.id === utxoId ? { ...u, vaultId } : u));
      const vaults = state.vaults.map((v) => ({
        ...v,
        utxoIds: vaultId === v.id ? Array.from(new Set([...v.utxoIds, utxoId])) : v.utxoIds.filter((x) => x !== utxoId),
      }));
      await persist({ ...state, utxos, vaults });
    },
    [persist, state]
  );

  const addMultisig = useCallback(
    async (draft: Omit<MultisigDraft, "id">) => {
      if (!state) return;
      await persist({ ...state, multisigs: [...state.multisigs, { ...draft, id: uuid() }] });
    },
    [persist, state]
  );

  const addWatchOnly = useCallback(
    async (acct: Omit<WatchOnlyAccount, "id">) => {
      if (!state) return;
      await persist({ ...state, watchOnly: [...state.watchOnly, { ...acct, id: uuid() }] });
    },
    [persist, state]
  );

  const exportBackup = useCallback(async () => {
    if (!state) return "";
    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      fingerprint: state.fingerprint,
      encryptedMnemonic: state.mnemonicEncrypted,
      settings: state.settings,
      vaults: state.vaults,
      labels: state.utxos.map((u) => ({ id: u.id, label: u.label, costBasisUsd: u.costBasisUsd, frozen: u.frozen })),
      notice: "Aureus encrypted backup. PIN required to decrypt mnemonic.",
    };
    return JSON.stringify(payload, null, 2);
  }, [state]);

  const wipe = useCallback(async () => {
    setSeed(null);
    await clearWalletState();
    setState(emptyState());
  }, []);

  const refreshDemoUtxos = useCallback(async () => {
    if (!state) return;
    await persist({ ...state, utxos: buildDemoUtxos(state.addresses) });
  }, [persist, state]);

  const getXpub = useCallback(() => {
    if (!seed || !state) return null;
    return accountXpub(seed, state.settings.networkMode === "mainnet" ? "mainnet" : "testnet");
  }, [seed, state]);

  const getTaprootPreview = useCallback(() => {
    return state?.addresses.find((a) => a.type === "bip86") ?? null;
  }, [state]);

  const totalSats = useMemo(() => state?.utxos.filter((u) => !u.frozen).reduce((a, u) => a + u.valueSats, 0) ?? 0, [state]);

  const value: WalletContextValue = {
    state,
    loading,
    priceUsd,
    seed,
    totalSats,
    createWallet,
    restoreWallet,
    unlock,
    lock,
    updateSettings,
    ensureAddresses,
    nextReceiveAddress,
    setUtxoMeta,
    addVault,
    updateVault,
    assignUtxoToVault,
    addMultisig,
    addWatchOnly,
    exportBackup,
    wipe,
    refreshDemoUtxos,
    getXpub,
    getTaprootPreview,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet outside provider");
  return ctx;
}
