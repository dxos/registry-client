//
// Copyright 2019 Wireline, Inc.
//

import { Signature, Payload, Transaction } from './types';

/**
 * Transaction builder.
 */
export class TxBuilder {
  /**
   * Generates registry message.
   * @param {object} record
   */
  static generatePayload(record) {
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
   * @param {object} message
   * @param {object} account
   * @param {string} accountNumber
   * @param {string} accountSequence
   * @param {string} chainID
   */
  static createTransaction(message, account, accountNumber, accountSequence, chainID) {
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
