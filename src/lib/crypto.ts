import { generateMnemonic, mnemonicToSeedSync, validateMnemonic, entropyToMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { HDKey } from "@scure/bip32";
import * as bitcoin from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as ecc from "@bitcoinerlab/secp256k1";

bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

export type WordCount = 12 | 24;

export function createMnemonic(words: WordCount = 12): string {
  const strength = words === 24 ? 256 : 128;
  return generateMnemonic(wordlist, strength);
}

export function isValidMnemonic(mnemonic: string): boolean {
  return validateMnemonic(mnemonic.trim().split(/\s+/).join(" "), wordlist);
}

export function mnemonicFromEntropyHex(hex: string): string {
  return entropyToMnemonic(Buffer.from(hex, "hex"), wordlist);
}

export function deriveSeed(mnemonic: string, passphrase = ""): Uint8Array {
  return mnemonicToSeedSync(mnemonic.trim().split(/\s+/).join(" "), passphrase);
}

export function getNetwork(mode: "demo" | "testnet" | "mainnet") {
  if (mode === "mainnet") return bitcoin.networks.bitcoin;
  return bitcoin.networks.testnet;
}

export function fingerprintFromSeed(seed: Uint8Array): string {
  const root = HDKey.fromMasterSeed(seed);
  const fp = root.fingerprint;
  return Buffer.from([(fp >> 24) & 0xff, (fp >> 16) & 0xff, (fp >> 8) & 0xff, fp & 0xff]).toString("hex");
}

/** BIP84 native SegWit: m/84'/coin'/0'/0/i */
export function deriveBip84Address(seed: Uint8Array, index: number, mode: "demo" | "testnet" | "mainnet", change = 0): { address: string; path: string; pubkey: Buffer } {
  const network = getNetwork(mode);
  const coin = mode === "mainnet" ? 0 : 1;
  const path = `m/84'/${coin}'/0'/${change}/${index}`;
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(path);
  if (!child.publicKey) throw new Error("Missing public key");
  const pubkey = Buffer.from(child.publicKey);
  const { address } = bitcoin.payments.p2wpkh({ pubkey, network });
  if (!address) throw new Error("Failed to derive address");
  return { address, path, pubkey };
}

/** BIP86 Taproot preview: m/86'/coin'/0'/0/i */
export function deriveBip86Address(seed: Uint8Array, index: number, mode: "demo" | "testnet" | "mainnet"): { address: string; path: string } {
  const network = getNetwork(mode);
  const coin = mode === "mainnet" ? 0 : 1;
  const path = `m/86'/${coin}'/0'/0/${index}`;
  const root = HDKey.fromMasterSeed(seed);
  const child = root.derive(path);
  if (!child.privateKey) throw new Error("Missing private key");
  const internalPubkey = Buffer.from(child.publicKey!.slice(1, 33));
  const { address } = bitcoin.payments.p2tr({ internalPubkey, network });
  if (!address) throw new Error("Failed to derive taproot address");
  return { address, path };
}

export function accountXpub(seed: Uint8Array, mode: "demo" | "testnet" | "mainnet"): string {
  const coin = mode === "mainnet" ? 0 : 1;
  const root = HDKey.fromMasterSeed(seed);
  const account = root.derive(`m/84'/${coin}'/0'`);
  return account.publicExtendedKey;
}

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Buffer.from(hash).toString("hex");
}

export async function derivePinKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptSecret(plaintext: string, pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await derivePinKey(pin, salt);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  const packed = new Uint8Array(salt.length + iv.length + cipher.byteLength);
  packed.set(salt, 0);
  packed.set(iv, 16);
  packed.set(new Uint8Array(cipher), 28);
  return Buffer.from(packed).toString("base64");
}

export async function decryptSecret(payload: string, pin: string): Promise<string> {
  const packed = Buffer.from(payload, "base64");
  const salt = packed.subarray(0, 16);
  const iv = packed.subarray(16, 28);
  const data = packed.subarray(28);
  const key = await derivePinKey(pin, salt);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(plain);
}

export function satsToBtc(sats: number): number {
  return sats / 1e8;
}

export function btcToSats(btc: number): number {
  return Math.round(btc * 1e8);
}

export function formatBtc(sats: number, discreet = false): string {
  if (discreet) return "••••••••";
  return satsToBtc(sats).toFixed(8) + " BTC";
}

export function formatUsd(usd: number, discreet = false): string {
  if (discreet) return "$••••••";
  return usd.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** BIP47-inspired payment code stub (not full BIP47 networking) */
export function stubPaymentCode(fingerprint: string): string {
  const body = Buffer.from("PM" + fingerprint + "aureus47").toString("base64url");
  return "PM8" + body.slice(0, 111);
}

export { ECPair, bitcoin, ecc };
