export type NetworkMode = "demo" | "testnet" | "mainnet";

export interface UTXO {
  id: string;
  txid: string;
  vout: number;
  address: string;
  valueSats: number;
  label?: string;
  frozen?: boolean;
  costBasisUsd?: number;
  vaultId?: string;
  confirmations: number;
}

export interface AddressEntry {
  index: number;
  address: string;
  path: string;
  used: boolean;
  type: "bip84" | "bip86";
}

export interface Vault {
  id: string;
  name: string;
  targetBtc: number;
  unlockDate: string;
  utxoIds: string[];
  notes?: string;
}

export interface MultisigDraft {
  id: string;
  name: string;
  m: number;
  n: number;
  cosigners: string[];
  scriptType: "wsh-p2wsh";
  psbtBase64?: string;
}

export interface WatchOnlyAccount {
  id: string;
  name: string;
  xpub: string;
  derivation: string;
}

export interface Settings {
  esploraUrl: string;
  electrumUrl: string;
  torProxyUrl: string;
  autoLockMinutes: number;
  discreetMode: boolean;
  networkMode: NetworkMode;
  mainnetUnlocked: boolean;
}

export interface WalletState {
  hasWallet: boolean;
  unlocked: boolean;
  fingerprint: string;
  mnemonicEncrypted?: string;
  pinHash?: string;
  passphraseUsed: boolean;
  receiveIndex: number;
  changeIndex: number;
  addresses: AddressEntry[];
  utxos: UTXO[];
  vaults: Vault[];
  multisigs: MultisigDraft[];
  watchOnly: WatchOnlyAccount[];
  paymentCode: string;
  settings: Settings;
  createdAt?: string;
}
