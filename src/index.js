//
// Copyright 2019 Wireline, Inc.
//

import { RegistryClient } from './registry_client';

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Record } from './types';

const CHAIN = 'wireline';

/**
 * Wireline registry SDK.
 */
export class Registry {
  constructor(url) {
    this.client = new RegistryClient(url);
  }

  /**
   * Mutate registry.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} operation
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async _submit(privateKey, record, operation, transactionPrivateKey) {
    // 1. Get account details.
    let account = new Account(Buffer.from(privateKey, 'hex'));
    let accountDetails = await this.getAccounts([account.formattedCosmosAddress]);
    console.assert(accountDetails.length, 'Can not find account to sign the message in registry.');

    let signingAccount = transactionPrivateKey ? new Account(Buffer.from(transactionPrivateKey, 'hex')) : account;
    let signingAccountDetails = transactionPrivateKey ? await this.getAccounts([signingAccount.formattedCosmosAddress]) : accountDetails;
    console.assert(signingAccountDetails.length, 'Can not find account to sign the transaction in registry.');

    // 2. Generate message.
    let registryRecord = new Record(record, account);
    let payload = TxBuilder.generatePayload(registryRecord);

    // 3. Generate transaction.
    let { number, sequence } = signingAccountDetails[0];
    let transaction = TxBuilder.createTransaction(payload, signingAccount, number.toString(), sequence.toString(), CHAIN, operation);

    let tx = btoa(JSON.stringify(transaction, null, 2));

    // 4. Send transaction.
    return this.client.submit(tx);
  }

  /**
   * Get accounts by addresses.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    return this.client.getAccounts(addresses);
  }

  /**
   * Get records by ids.
   * @param {array} ids
   */
  async getRecordsByIds(ids) {
    return this.client.getRecordsByIds(ids);
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   */
  async getRecordsByAttributes(attributes) {
    return this.client.getRecordsByAttributes(attributes);
  }

  async getBotsByAttributes(attributes) {
    return this.client.getBotsByAttributes(attributes);
  }

  /**
   * Publish record.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async setRecord(privateKey, record, transactionPrivateKey) {
    return this._submit(privateKey, record, 'set', transactionPrivateKey);
  }

  /**
   * Delete record.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async deleteRecord(privateKey, record, transactionPrivateKey) {
    return this._submit(privateKey, record, 'delete', transactionPrivateKey);
  }
}

export { Account };
