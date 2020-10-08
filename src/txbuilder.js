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
  static generatePayload(record) {
    // Registry signature.
    const { ownerAccount: account } = record;
    const messageToSign = record.getMessageToSign();
    console.log('Should not be here');
    const sig = account.signRecord(messageToSign);
    const signature = new Signature(account.registryPublicKey, sig.toString('base64'));

    const payload = new Payload(record, signature);
    return payload;
  }

  /**
   * Generates registry message.
   * @param {object} record
   */
  static async generatePayloadWallet(record, walletSigner) {
    // Registry signature.
    const { ownerAccount: account } = record; // eslint-disable-line no-unused-vars
    console.log('generatePayloadWallet1');
    const messageToSign = record.getMessageToSign();
    console.log('generatePayloadWallet2');
    const walletSignature = await walletSigner.sign(messageToSign);
    console.log('generatePayloadWallet3');
    const sig = walletSignature.signature;
    console.log('generatePayloadWallet4');
    const signature = new Signature(walletSignature.registryPublicKey, sig.toString('base64'));
    console.log('generatePayloadWallet5');

    const payload = new Payload(record, signature);
    console.log('generatePayloadWallet6');
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
    console.log('createTransaction, chainId', chainID);
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
    console.log('regular transactionSig', transactionSig);
    console.log('regular publicKey', account.publicKey.toString('base64'));
    console.log('regular transactionSig to string', transactionSig.toString());
    console.log('regular transactionSig to string', transactionSig.toString('base64'));

    const transaction = new Transaction(message, account.publicKey.toString('base64'), fee, transactionSig, chainID);
    return transaction.serialize();
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
  static async createTransactionWallet(message, walletSigner, accountNumber, accountSequence, chainID, fee) {
    // 1. Compose StdSignDoc.
    console.log('createTransactionWallet, message', message, 'serialized message', message.serialize(), 'chainId:', chainID);
    const stdSignDoc = {
      account_number: accountNumber,
      chain_id: chainID,
      fee,
      memo: '',
      msgs: [message.serialize()],
      sequence: accountSequence
    };

    console.log('createTransactionWallet1');
    // 2. Calculate Signature.
    const transactionDataToSign = Buffer.from(canonicalStringify(stdSignDoc));
    const transactionSig = await walletSigner.sign(transactionDataToSign);
    console.log(`transactionSig: ${JSON.stringify(transactionSig)}`);
    console.log('wallet transactionSig', transactionSig);
    console.log('wallet publicKey', transactionSig.publicKey);

    const signature = Buffer.from(transactionSig.signature, 'base64');
    console.log('signature', signature);

    const transaction = new Transaction(message, transactionSig.publicKey, fee, signature, chainID);
    console.log(`transaction: ${JSON.stringify(transaction)}`);
    return transaction.serialize();
  }
}
