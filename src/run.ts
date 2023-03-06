import { LocalWallet } from "@sensible-contract/wallets";
import { transferBsv } from "./sensible";

async function run() {
  try {
    const wallet = LocalWallet.fromWIF("please input your WIF");
    let t = await transferBsv(
      {
        wallet,
        utxos: [
          {
            txId: "910bf4eade761fa2f92271681dc5c5a42a9e677980cc79c7b8f7986a57d5f8b3",
            outputIndex: 1,
            satoshis: 99966403529,
            address: "mpmgpAJbsvAtSrjZGtyQAA1en3AFHWigdV",
          },
        ],
        receivers: [
          {
            address: "mpmgpAJbsvAtSrjZGtyQAA1en3AFHWigdV", // your new address
            amount: 99966403529 - 12, // 12 as fee
          },
        ],
      },
      { noBroadcast: true, dumpTx: true }
    );
    console.log(t);
  } catch (e) {
    console.log(e);
  }
}
run();
