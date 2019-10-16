//
// Copyright 2019 Wireline, Inc.
//

import { Signature, Payload, Msg, Transaction } from './types';

/**
 * Transaction builder.
 */
export class TxBuilder {
  /**
   * Generates registry message.
   * @param {object} record
   */
  static generatePayload(record) {
    // TODO(Ashwin): message type.
    // Registry signature.
    const { ownerAccount: account } = record;
    const messageToSign = record.getMessageToSign();
    const sig = account.signRecord(messageToSign);
    const signature = new Signature(account.registryPublicKey, sig.toString('base64'));

    const payload = new Payload(record, signature);
    return payload;
  }

  /**
   * Generates transaction.
   * @param {object} payload
   * @param {object} account
   * @param {string} accountNumber
   * @param {string} accountSequence
   * @param {string} chainID
   * @param {string} operation
   */
  static createTransaction(payload, account, accountNumber, accountSequence, chainID, operation = 'set') {
    // 1. Generate message.

    // TODO(egor): Just take 'signer' param instead of 'account'?

    const message = new Msg(operation, payload, account.formattedCosmosAddress);

    // TODO(egorgripasov): class for fees.
    const fee = {
      amount: [
        // {
        //   "amount": "201",
        //   "denom": "wire"
        // }
      ],
      gas: '200000'
    };

    // 1. Compose StdSignDoc.
    const stdSignDoc = {
      account_number: accountNumber,
      chain_id: chainID,
      fee,
      memo: '',
      msgs: [message.serialize()],
      sequence: accountSequence
    };

    // 2. Calculate Signature.
    const transactionDataToSign = Buffer.from(JSON.stringify(stdSignDoc));
    const transactionSig = account.sign(transactionDataToSign);

    const transaction = new Transaction(message, account, fee, transactionSig, accountNumber, accountSequence, chainID);
    return transaction.serialize();
  }
}
