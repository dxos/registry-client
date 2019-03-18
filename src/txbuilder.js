//
// Copyright 2019 Wireline, Inc.
//

import { Signature, Payload, Msg, Transaction } from './types';

// TODO(egorgripasov): class for fees.
// TODO(egorgripasov): Requirement for fees has been removed. Can keep this code but update to set zero fees.
const FEE = {
  "amount": [
    // {
    //   "amount": "201",
    //   "denom": "wire"
    // }
  ],
  "gas": "200000"
}

/**
 * Transaction builder.
 */
export class TxBuilder {
  /**
   * Generates registry message.
   * @param {object} resource
   */
  static generatePayload(resource) {
    // TODO(Ashwin): message type.
    // Registry signature.
    let { ownerAccount: account } = resource;
    let messageToSign = resource.getMessageToSign();
    let sig = account.signResource(messageToSign);
    let signature = new Signature(account.registryPublicKey, sig.toString('base64'));

    let payload = new Payload(resource, signature);
    return payload;
  }

  /**
   * Generates transaction.
   * @param {object} payload
   * @param {object} account
   * @param {string} accountNumber
   * @param {string} accountSequence
   * @param {string} chainID
   */
  static createTransaction(payload, account, accountNumber, accountSequence, chainID) {
    // 1. Generate message.

    // TODO(egor): Just take 'signer' param instead of 'account'?

    let message = new Msg(payload, account.formattedCosmosAddress);
    // 1. Compose StdSignDoc.
    let stdSignDoc = {
      account_number: accountNumber,
      chain_id: chainID,
      fee: FEE,
      memo: '',
      msgs: [message.serialize()],
      sequence: accountSequence
    };

    // 2. Calculate Signature.
    let transactionDataToSign = Buffer.from(JSON.stringify(stdSignDoc));
    let transactionSig = account.sign(transactionDataToSign);

    let transaction = new Transaction(message, account, FEE, transactionSig, accountNumber, accountSequence);

    return transaction.serialize();
  }
}
