//
// Copyright 2019 Wireline, Inc.
//

import graphql from 'graphql.js';

/**
 * Registry
 */
// TODO(egor): Rename to Client or RegistryClient. Cli reminds one of 'command line interface'.
export class RegistryCli {
  static DEFAULT_ENDPOINT = 'http://localhost:8080/query';

  // TODO(egor): Comment.
  constructor(endpoint) {
    this.endpoint = endpoint || RegistryCli.DEFAULT_ENDPOINT;
    this.graph = graphql(this.endpoint, {
      method: "POST",
      asJSON: true
    })
  }

  async _getResult(query, key) {
    let result = await query;
    if (result && result[key] && result[key].length && result[key][0] !== null) {
      return result[key];
    }
    return [];
  }

  // TODO(egor): Comment.
  async getAccounts(addresses) {
    console.assert(addresses);
    console.assert(addresses.length);

    let query = `query ($addresses: [String!]) {
      getAccounts(addresses: $addresses) {
        address
        pubKey
        num
        seq
        coins {
          denom
          amount
        }
      }
    }`

    let variables = {
      addresses
    }

    return this._getResult(this.graph(query)(variables), 'getAccounts');
  }

  // TODO(egor): Comment.
  async getResources(ids) {
    console.assert(ids);
    console.assert(ids.length);

    let query = `query ($ids: [String!]) {
      getResources(ids: $ids) {
        id
        type
        owner {
          id
          address
        }
        systemAttributes
        attributes
        links {
          id
          attributes
        }
      }
    }`

    let variables = {
      ids
    }

    return this._getResult(this.graph(query)(variables), 'getResources');
  }

  // TODO(egor): Comment.
  async listResources() {
    let query = `query {
      listResources {
        id
        type
        owner {
          id
          address
        }
        systemAttributes
        attributes
        links {
          id
          attributes
        }
      }
    }`

    return this._getResult(this.graph(query)(variables), 'listResources');
  }

  // TODO(egor): Comment.
  getBots(name) {
    throw new Error('Not implemented.');
  }

  // TODO(egor): Comment.
  getPseudonyms(name) {
    throw new Error('Not implemented.');
  }

  // TODO(egor): Comment.
  async broadcastTxCommit(tx) {
    console.assert(tx);

    let mutation = `mutation ($tx: String!) {
      broadcastTxCommit(tx: $tx)
    }`

    let variables = {
      tx
    }

    return this.graph(mutation)(variables);
  }
}