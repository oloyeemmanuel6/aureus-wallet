# Aureus

Premium Bitcoin-only self-custody wallet for macOS (Electron desktop app with DMG packaging).

> MVP — not audited for production mainnet funds. Default to demo or testnet. Mainnet is gated as advanced.

## Hard product rules

- Bitcoin only — no altcoins/tokens/ETH
- **NO coin mixing** — no CoinJoin, Whirlpool, Wasabi, JoinMarket, or any mixer. Non-negotiable.
- Self-custody: keys stay on-device (PIN + AES-GCM)
- Demo/testnet first

## Architecture

- Electron + Vite + React + TypeScript + Tailwind
- bitcoinjs-lib, @scure/bip39, @scure/bip32, WebCrypto
- BIP84 SegWit default; BIP86 Taproot shown as upgrade path
- HashRouter for file:// loads inside the Mac app
- Storage via Electron userData IPC (localStorage fallback in browser preview)

## Setup

Install dependencies, then use package scripts:

- \`dev\` — Vite UI at http://127.0.0.1:5173
- \`build:main\` then start with ELECTRON_START_URL pointing at Vite
- \`build\` — compile renderer + main
- \`dist\` / \`package:mac\` — **build the .dmg on a Mac** (darwin only; output in \`release/\`)

Linux can compile TypeScript/Vite but cannot reliably produce a signed Mac DMG. Documented path: on macOS run the \`dist\` script.

## Install DMG

1. Open the `.dmg` file (double-click).
2. Drag **Aureus** into **Applications**.
3. First launch (unsigned local build): right-click the app and choose Open.
   Or clear quarantine with:

```bash
xattr -cr /Applications/Aureus.app
```

4. Then open Aureus from Applications as usual.

To build the DMG on an Apple Silicon Mac:

```bash
./scripts/build-dmg-mac.sh
# or use the dist:arm64 package script
```

Output: `release/*.dmg`


## Features

Landing, onboarding (BIP39 12/24 + passphrase + PIN), dashboard, send (coin control, fee tiers, RBF, batch, merge-avoidance alert), receive (fresh addresses, no-reuse, PayNym-style stub), UTXO lab, vaults (targets/unlock dates, 2-of-3 PSBT stub, inheritance checklist), PSBT lab + watch-only + QR airgap, settings (Esplora/Electrum/Tor/auto-lock/backup).

## Stubs / limitations

- Demo UTXOs for offline UI polish
- PSBT drafts are illustrative; broadcast not wired
- BIP47 payment code is UI/QR stub (see Receive)
- Vault unlock dates are client-side policy, not on-chain timelocks
- Tor proxy field stored for future routing

## Security

Not audited. Do not store significant mainnet value. No mixing tools are included or planned.
