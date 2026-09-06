import * as bitcoin from "bitcoinjs-lib";
import type { UTXO } from "./types";

export interface DraftOutput {
  address: string;
  valueSats: number;
}

export interface DraftTx {
  inputs: UTXO[];
  outputs: DraftOutput[];
  feeRateSatVb: number;
  rbf: boolean;
  estimatedVbytes: number;
  feeSats: number;
  mergeAvoidanceWarning: boolean;
  psbtBase64: string;
}

export function estimateVbytes(inputCount: number, outputCount: number): number {
  // rough P2WPKH estimate
  return 10 + inputCount * 68 + outputCount * 31;
}

export function buildDraftTx(
  inputs: UTXO[],
  outputs: DraftOutput[],
  feeRateSatVb: number,
  rbf: boolean,
  networkMode: "demo" | "testnet" | "mainnet"
): DraftTx {
  const network = networkMode === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
  const changeOut = outputs.length;
  const vbytes = estimateVbytes(inputs.length, Math.max(outputs.length, 1) + 1);
  const feeSats = Math.ceil(vbytes * feeRateSatVb);
  const totalIn = inputs.reduce((a, u) => a + u.valueSats, 0);
  const totalOut = outputs.reduce((a, o) => a + o.valueSats, 0);
  const mergeAvoidanceWarning = inputs.length >= 3 && outputs.length === 1;

  const psbt = new bitcoin.Psbt({ network });
  // Demo/stub PSBT: add placeholder witness UTXOs so UI can export a PSBT-looking blob
  inputs.forEach((utxo, idx) => {
    const txid = utxo.txid.length === 64 ? utxo.txid : utxo.txid.padStart(64, "0");
    psbt.addInput({
      hash: txid,
      index: utxo.vout,
      sequence: rbf ? 0xfffffffd : 0xffffffff,
      witnessUtxo: {
        script: Buffer.from("0014" + "11".repeat(20), "hex"),
        value: utxo.valueSats,
      },
    });
    void idx;
  });
  outputs.forEach((o) => {
    try {
      psbt.addOutput({ address: o.address, value: o.valueSats });
    } catch {
      psbt.addOutput({ script: Buffer.from("6a", "hex"), value: o.valueSats });
    }
  });
  const change = totalIn - totalOut - feeSats;
  if (change > 546) {
    psbt.addOutput({ script: Buffer.from("0014" + "22".repeat(20), "hex"), value: change });
  }

  let psbtBase64 = "";
  try {
    psbtBase64 = psbt.toBase64();
  } catch {
    psbtBase64 = Buffer.from(JSON.stringify({ inputs, outputs, feeRateSatVb, rbf, demo: true })).toString("base64");
  }

  return {
    inputs,
    outputs,
    feeRateSatVb,
    rbf,
    estimatedVbytes: vbytes,
    feeSats,
    mergeAvoidanceWarning,
    psbtBase64,
  };
}
