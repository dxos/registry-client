//
// Copyright 2019 Wireline, Inc.
//

import isUrl from 'is-url';
import { resolve } from 'url';

import { RegistryClient } from './registry_client';

import { Account } from './account';
import { Util } from './util';
import { TxBuilder } from './txbuilder';
import { Msg, Record } from './types';

import {
  MsgSend,
  MsgCreateBond,
  MsgRefillBond,
  MsgWithdrawBond,
  MsgCancelBond,
  MsgAssociateBond,
  MsgDissociateBond,
  MsgDissociateRecords
} from './messages';

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
   * @param {string} bondId
   */
  async setRecord(privateKey, record, transactionPrivateKey, bondId) {
    let result;
    try {
      if (process.env.MOCK_SERVER) {
        result = await this._client.insertRecord(record, bondId);
      } else {
        result = await this._submitRecordTx(privateKey, record, 'nameservice/SetRecord', transactionPrivateKey, bondId);
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
    return this._submitRecordTx(privateKey, record, 'nameservice/DeleteRecord', transactionPrivateKey);
  }

  /**
   * Send coins.
   * @param {object[]} amount
   * @param {string} toAddress
   * @param {string} privateKey
   */
  async sendCoins(amount, toAddress, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgSend(fromAddress, toAddress, amount), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Get bonds by ids.
   * @param {array} ids
   */
  async getBondsByIds(ids) {
    return this._client.getBondsByIds(ids);
  }

  /**
   * Query bonds by attributes.
   * @param {object} attributes
   */
  async queryBonds(attributes) {
    return this._client.queryBonds(attributes);
  }

  /**
   * Create bond.
   * @param {object[]} amount
   * @param {string} privateKey
   */
  async createBond(amount, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgCreateBond(fromAddress, amount), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Refill bond.
   * @param {string} id
   * @param {object[]} amount
   * @param {string} privateKey
   */
  async refillBond(id, amount, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgRefillBond(id, fromAddress, amount), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Withdraw (from) bond.
   * @param {string} id
   * @param {object[]} amount
   * @param {string} privateKey
   */
  async withdrawBond(id, amount, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgWithdrawBond(id, fromAddress, amount), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Cancel bond.
   * @param {string} id
   * @param {string} privateKey
   */
  async cancelBond(id, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgCancelBond(id, fromAddress), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Associate record with bond.
   * @param {string} id
   * @param {string} bondId
   * @param {string} privateKey
   */
  async associateBond(id, bondId, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgAssociateBond(id, bondId, fromAddress), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Dissociate record from bond.
   * @param {string} id
   * @param {string} privateKey
   */
  async dissociateBond(id, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgDissociateBond(id, fromAddress), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Dissociate all records from bond.
   * @param {string} bondId
   * @param {string} privateKey
   */
  async dissociateRecords(bondId, privateKey) {
    let result;
    try {
      const account = new Account(Buffer.from(privateKey, 'hex'));
      const fromAddress = account.formattedCosmosAddress;
      result = await this._submitTx(new MsgDissociateRecords(bondId, fromAddress), privateKey);
    } catch (err) {
      const error = err[0] || err;
      throw new Error(Registry.processWriteError(error));
    }
    return result;
  }

  /**
   * Submit record transaction.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} record
   * @param {string} operation
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   * @param {string} bondId
   */
  async _submitRecordTx(privateKey, record, operation, transactionPrivateKey, bondId) {
    if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error('Registry privateKey should be a hex string.');
    }

    if (!bondId || !bondId.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error(`Invalid bondId: ${bondId}.`);
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
    const message = new Msg(operation, {
      'bondId': bondId,
      'payload': payload.serialize(),
      'signer': signingAccount.formattedCosmosAddress.toString()
    });

    // 3. Generate transaction.
    const { number, sequence } = signingAccountDetails[0];
    const transaction = TxBuilder.createTransaction(message, signingAccount, number.toString(), sequence.toString(), CHAIN);
    const tx = btoa(JSON.stringify(transaction, null, 2));

    // 4. Send transaction.
    return this._client.submit(tx);
  }

  /**
   * Submit a generic Tx to the chain.
   * @param {object} message
   * @param {string} privateKey - private key in HEX to sign transaction.
   */
  async _submitTx(message, privateKey) {
    // Check private key.
    if (!privateKey.match(/^[0-9a-fA-F]{64}$/)) {
      throw new Error('Registry privateKey should be a hex string.');
    }

    // Check that the account exists on-chain.
    const account = new Account(Buffer.from(privateKey, 'hex'));
    const accountDetails = await this.getAccounts([account.formattedCosmosAddress]);
    if (!accountDetails.length) {
      throw new Error('Can not sign the transaction - account does not exist.');
    }

    // Generate signed Tx.
    const { number, sequence } = accountDetails[0];
    const transaction = TxBuilder.createTransaction(message, account, number.toString(), sequence.toString(), CHAIN);
    const tx = btoa(JSON.stringify(transaction, null, 2));

    // Submit Tx to chain.
    return this._client.submit(tx);
  }
}

export { Account, Util };
