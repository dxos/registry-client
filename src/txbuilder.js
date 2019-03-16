//
// Copyright 2019 Wireline, Inc.
//

import { Signature, Payload, Msg, Transaction } from './types';

// TODO(egorgripasov): class for fees.
const FEE = {
  "amount": [
    {
      "amount": "201",
      "denom": "wire"
    }
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
    // Wirechain signature.
    let { ownerAccount: account } = resource;
    let messageToSign = resource.getMessageToSign();
    let sig = account.signResource(messageToSign);
    let signature = new Signature(account.wirechainPublicKey, sig.toString('base64'));

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
    let message = new Msg(payload, account.formattedCosmosAddress);
    // 1. Compose StdSignDoc.
    let StdSignDoc = {
      account_number: accountNumber,
      chain_id: chainID,
      fee: FEE,
      memo: "",
      msgs: [message.serialize()],
      sequence: accountSequence,
    }

    // 2. Calculate Signature.
    let transactionDataToSign = Buffer.from(JSON.stringify(StdSignDoc));
    let transactionSig = account.sign(transactionDataToSign);

    let transaction = new Transaction(message, account, FEE, transactionSig, accountNumber, accountSequence)

    return transaction.serialize();
  }
}
