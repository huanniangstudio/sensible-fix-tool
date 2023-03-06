import { Wallet } from "@sensible-contract/abstract-wallet";
import * as bsv from "@sensible-contract/bsv";

const P2PKH_UNLOCK_SIZE = 1 + 1 + 72 + 1 + 33;
import { TxComposer } from "@sensible-contract/tx-composer";

TxComposer.setGlobalConfig(0.05, 300);

export type Utxo = {
  txId: string;
  outputIndex: number;
  satoshis: number;
  address: string;
};

export type TxOptions = {
  onlyEstimateFee?: boolean;
  noBroadcast?: boolean;
  dumpTx?: boolean;
};

export const DEFAULT_TX_OPTIONS: TxOptions = {
  onlyEstimateFee: false,
  noBroadcast: false,
  dumpTx: false,
};

export async function transferBsv(
  {
    wallet,
    receivers,
    utxos,
    opreturnData,
  }: {
    wallet: Wallet;
    receivers: {
      address: string;
      amount: number;
    }[];
    utxos?: Utxo[];
    opreturnData?: any;
  },
  options: TxOptions = DEFAULT_TX_OPTIONS
) {
  const txComposer = new TxComposer();
  let address = await wallet.getAddress();
  let balance = utxos.reduce((pre, cur) => cur.satoshis + pre, 0);

  utxos.forEach((v, index) => {
    txComposer.appendP2PKHInput({
      address: new bsv.Address(v.address),
      txId: v.txId,
      outputIndex: v.outputIndex,
      satoshis: v.satoshis,
    });
    txComposer.addInputInfo({
      inputIndex: index,
    });
  });

  let mainUtxoLength = utxos.length;

  receivers.forEach((v) => {
    txComposer.appendP2PKHOutput({
      address: new bsv.Address(v.address),
      satoshis: v.amount,
    });
  });

  if (opreturnData) {
    txComposer.appendOpReturnOutput(opreturnData);
  }

  txComposer.appendChangeOutput(new bsv.Address(address));

  const unlockSize = txComposer.getTx().inputs.length * P2PKH_UNLOCK_SIZE;
  let fee = Math.ceil(
    (txComposer.getTx().toBuffer().length + unlockSize) * txComposer.feeRate
  );
  if (options.onlyEstimateFee) return { fee };
  if (balance < fee) throw new Error("Insufficient Bsv Balance.");

  let sigResults = await wallet.signTransaction(
    txComposer.getRawHex(),
    txComposer.getInputInfos().slice(0, mainUtxoLength)
  );

  let sigResults2 = [];

  sigResults = sigResults.concat(sigResults2);

  txComposer.unlock(sigResults);

  if (options.dumpTx) {
    txComposer.dumpTx();
  }

  if (options.noBroadcast) {
    return { rawtx: txComposer.getRawHex() };
  } else {
    throw new Error("unsupport");
  }
}
