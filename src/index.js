//
// Copyright 2019 Wireline, Inc.
//

import { RegistryCli } from './registry_cli';

import { Account } from './account';
import { TxBuilder } from './txbuilder';
import { Resource } from './types';

const CHAIN = 'wireline';

/**
 * Wireline registry SDK.
 */
export class Registry {
  constructor(url) {
    this.client = new RegistryCli(url);
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
   * Publish resource.
   * @param {string} privateKey - private key in HEX to sign message.
   * @param {string} resourceId
   * @param {string} resourceType
   * @param {object} systemAttributes 
   * @param {object} attributes 
   * @param {object} links 
   * @param {object} transactionPrivateKey - private key in HEX to sign transaction.
   */
  async setResource(privateKey, resourceId, resourceType, systemAttributes, attributes, links, transactionPrivateKey) {
    // 1. Get account details.
    let account = new Account(Buffer.from(privateKey, 'hex'));
    let accountDetails = await this.getAccounts([account.formattedCosmosAddress]);
    console.assert(accountDetails.length, 'Can not find account to sign the message in registry.');

    let signingAccount = transactionPrivateKey ? new Account(Buffer.from(transactionPrivateKey, 'hex')) : account;
    let signingAccountDetails = transactionPrivateKey ? await this.getAccounts([signingAccount.formattedCosmosAddress]) : accountDetails;
    console.assert(signingAccountDetails.length, 'Can not find account to sign the transaction in registry.');

    // 2. Generate message.
    let resource = new Resource(resourceId, resourceType, account, systemAttributes, attributes, links);
    let payload = TxBuilder.generatePayload(resource);

    // 3. Generate transaction.
    let { num, seq } = signingAccountDetails[0];
    let transaction = TxBuilder.createTransaction(payload, signingAccount, num.toString(), seq.toString(), CHAIN);
    
    let tx = btoa(JSON.stringify(transaction, null, 2));

    // 4. Send transaction.
    return this.client.broadcastTxCommit(tx);
  }
}

export { Account };
