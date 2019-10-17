//
// Copyright 2019 Wireline, Inc.
//

import isUrl from 'is-url';
import { resolve } from 'url';

import { RegistryClient } from './registry_client';

import { Account } from './account';
import { Util } from './util';
import { TxBuilder } from './txbuilder';
import { Record } from './types';

const CHAIN = 'wireline';
const GQL_PATH = '/query';

/**
 * Wireline registry SDK.
 */
export class Registry {
  constructor(url) {
    if (!isUrl(url)) {
      throw new Error('Path to a registry GQL endpoint should be provided.');
    }

    if (!url.endsWith(GQL_PATH)) {
      url = resolve(url, GQL_PATH);
    }

    this._client = new RegistryClient(url);
  }

  /**
   * Get accounts by addresses.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    return this._client.getAccounts(addresses);
  }

  /**
   * Get records by ids.
   * @param {array} ids
   */
  async getRecordsByIds(ids) {
    return this._client.getRecordsByIds(ids);
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   */
  async queryRecords(attributes) {
    return this._client.queryRecords(attributes);
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

  /**
   * Mutate registry.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} operation
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async _submit(privateKey, record, operation, transactionPrivateKey) {
    if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error('Registry privateKey should be a hex string.');
    }

    // 1. Get account details.
    const account = new Account(Buffer.from(privateKey, 'hex'));
    const accountDetails = await this.getAccounts([account.formattedCosmosAddress]);
    console.assert(accountDetails.length, 'Can not find account to sign the message in registry.');

    const signingAccount = transactionPrivateKey ? new Account(Buffer.from(transactionPrivateKey, 'hex')) : account;
    /* eslint-disable max-len */
    const signingAccountDetails = transactionPrivateKey ? await this.getAccounts([signingAccount.formattedCosmosAddress]) : accountDetails;
    console.assert(signingAccountDetails.length, 'Can not find account to sign the transaction in registry.');

    // 2. Generate message.
    const registryRecord = new Record(record, account);
    const payload = TxBuilder.generatePayload(registryRecord);

    // 3. Generate transaction.
    const { number, sequence } = signingAccountDetails[0];
    const transaction = TxBuilder.createTransaction(
      payload, signingAccount, number.toString(), sequence.toString(), CHAIN, operation
    );

    const tx = btoa(JSON.stringify(transaction, null, 2));

    // 4. Send transaction.
    return this._client.submit(tx);
  }
}

export { Account, Util };
