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
const GQL_PATH = '/graphql';

const DEFAULT_WRITE_ERROR = 'Unable to write to WNS.';

/**
 * Wireline registry SDK.
 */
export class Registry {

  static processWriteError(error) {
    let message = (error.message || DEFAULT_WRITE_ERROR).replace(/(\\)+/g, '');
    const wnsMessage = /"message":"(.*?)"/g.exec(message);
    message = wnsMessage && wnsMessage[1] ? wnsMessage[1] : message;
    return message;
  }

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
   * @param {boolean} refs
   */
  async getRecordsByIds(ids, refs = false) {
    return this._client.getRecordsByIds(ids, refs);
  }

  /**
   * Get records by attributes.
   * @param {object} attributes
   * @param {boolean} refs
   */
  async queryRecords(attributes, refs = false) {
    return this._client.queryRecords(attributes, refs);
  }

  /**
   * Resolve records by refs.
   * @param {array} references
   * @param {boolean} refs
   */
  async resolveRecords(references, refs = false) {
    return this._client.resolveRecords(references, refs);
  }

  /**
   * Publish record.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async setRecord(privateKey, record, transactionPrivateKey) {
    let result;
    try {
      if (process.env.MOCK_SERVER) {
        result = await this._client.insertRecord(record);
      } else {
        result = await this._submit(privateKey, record, 'set', transactionPrivateKey);
      }
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
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
    if (!accountDetails.length) {
      throw new Error('Can not sign the message - account does not exist.');
    }

    const signingAccount = transactionPrivateKey ? new Account(Buffer.from(transactionPrivateKey, 'hex')) : account;
    /* eslint-disable max-len */
    const signingAccountDetails = transactionPrivateKey ? await this.getAccounts([signingAccount.formattedCosmosAddress]) : accountDetails;
    if (!signingAccountDetails.length) {
      throw new Error('Can not sign the transaction - account does not exist.');
    }

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
