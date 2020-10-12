//
// Copyright 2019 Wireline, Inc.
//

import canonicalStringify from 'canonical-json';

import { Signature, Payload, Transaction } from './types';

/**
 * Transaction builder.
 */
export class TxBuilder {
  /**
   * Generates registry message.
   * @param {object} record
   */
  static generatePayload(record, account) {
    // Registry signature.
    const messageToSign = record.getMessageToSign();
    const sig = account.signRecord(messageToSign);
    const signature = new Signature(account.publicKey.toString('base64'), sig.toString('base64'));

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
   * @param {object} fee
   */
  static createTransaction(message, account, accountNumber, accountSequence, chainID, fee) {
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
    const transactionDataToSign = Buffer.from(canonicalStringify(stdSignDoc));
    const transactionSig = account.sign(transactionDataToSign);

    const transaction = new Transaction(message, account, fee, transactionSig, chainID);
    return transaction.serialize();
  }
}
