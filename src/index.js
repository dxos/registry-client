//
// Copyright 2019 Wireline, Inc.
//

import { RegistryClient } from './registry_client';

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Resource } from './types';

const CHAIN = 'wireline';

/**
 * Wireline registry SDK.
 */
export class Registry {
  constructor(url) {
    this.client = new RegistryClient(url);
  }

  /**
   * Get accounts by addresses.
   * @param {array} addresses
   */
  async getAccounts(addresses) {
    return this.client.getAccounts(addresses);
  }

  /**
   * Get resources by ids.
   * @param {array} ids
   */
  async getResources(ids) {
    if (ids && ids.length) {
      return this.client.getResources(ids);
    } else {
      return this.client.listResources();
    }
  }

  /**
   * Get bots by names.
   * @param {array} names
   */
  async getBots(names) {
    return this.client.getBots(names);
  }

  /**
   * Get accounts by addresses.
   * @param {array} names
   */
  async getPseudonyms(names) {
    return this.client.getPseudonyms(names);
  }

  /**
   * Publish resource.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {object} resource
   * @param {string} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async setResource(privateKey, resource, transactionPrivateKey) {
    // 1. Get account details.
    let account = new Account(Buffer.from(privateKey, 'hex'));
    let accountDetails = await this.getAccounts([account.formattedCosmosAddress]);
    console.assert(accountDetails.length, 'Can not find account to sign the message in registry.');

    let signingAccount = transactionPrivateKey ? new Account(Buffer.from(transactionPrivateKey, 'hex')) : account;
    let signingAccountDetails = transactionPrivateKey ? await this.getAccounts([signingAccount.formattedCosmosAddress]) : accountDetails;
    console.assert(signingAccountDetails.length, 'Can not find account to sign the transaction in registry.');

    // 2. Generate message.
    let registryResource = new Resource(resource, account);
    let payload = TxBuilder.generatePayload(registryResource);

    // 3. Generate transaction.
    let { num, seq } = signingAccountDetails[0];
    let transaction = TxBuilder.createTransaction(payload, signingAccount, num.toString(), seq.toString(), CHAIN);

    let tx = btoa(JSON.stringify(transaction, null, 2));

    // 4. Send transaction.
    return this.client.broadcastTxCommit(tx);
  }
}

export { Account };
